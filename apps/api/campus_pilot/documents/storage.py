import asyncio
from pathlib import Path
from typing import Protocol

import boto3
from botocore.config import Config

from campus_pilot.core.config import Settings
from campus_pilot.documents.pipeline import UnsafeDocumentError, persist_quarantined


class DocumentStore(Protocol):
    async def put_quarantined(self, object_key: str, content: bytes) -> str: ...
    async def read(self, stored_key: str) -> bytes: ...


class LocalQuarantineStore:
    def __init__(self, root: str) -> None:
        self.root = root

    async def put_quarantined(self, object_key: str, content: bytes) -> str:
        return await asyncio.to_thread(persist_quarantined, content, self.root, object_key)

    async def read(self, stored_key: str) -> bytes:
        path = Path(stored_key).resolve()
        root = Path(self.root).resolve()
        if root not in path.parents:
            raise UnsafeDocumentError("Stored document escaped quarantine root")
        return await asyncio.to_thread(path.read_bytes)


class S3DocumentStore:
    def __init__(self, settings: Settings) -> None:
        self.bucket = settings.object_storage_bucket
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.object_storage_endpoint,
            aws_access_key_id=settings.object_storage_access_key,
            aws_secret_access_key=settings.object_storage_secret_key,
            config=Config(signature_version="s3v4"),
        )

    def _ensure_bucket(self) -> None:
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except self.client.exceptions.ClientError:
            self.client.create_bucket(Bucket=self.bucket)

    async def put_quarantined(self, object_key: str, content: bytes) -> str:
        await asyncio.to_thread(self._ensure_bucket)
        await asyncio.to_thread(
            self.client.put_object,
            Bucket=self.bucket,
            Key=f"quarantine/{object_key}",
            Body=content,
            ContentType="application/pdf",
            Metadata={"execution": "disabled", "scan-status": "pending"},
            ServerSideEncryption="AES256",
        )
        return f"s3://{self.bucket}/quarantine/{object_key}"

    async def read(self, stored_key: str) -> bytes:
        prefix = f"s3://{self.bucket}/"
        if not stored_key.startswith(prefix):
            raise UnsafeDocumentError("Invalid object storage key")
        response = await asyncio.to_thread(
            self.client.get_object, Bucket=self.bucket, Key=stored_key.removeprefix(prefix)
        )
        return await asyncio.to_thread(response["Body"].read)


def document_store(settings: Settings) -> DocumentStore:
    if (
        settings.object_storage_endpoint
        and settings.object_storage_access_key
        and settings.object_storage_secret_key
    ):
        return S3DocumentStore(settings)
    return LocalQuarantineStore(settings.upload_dir)
