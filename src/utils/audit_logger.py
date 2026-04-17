"""
AuditLogger — append-only audit trail for all patient data events.

Every read and write of patient data must call this logger.
Audit events are never deleted — retained for 7 years per healthcare regulations.
"""
import uuid
from datetime import datetime

import boto3
from botocore.exceptions import ClientError

from src.models.intake import AuditEvent

TABLE_NAME = "femcare-{env}-audit"


class AuditLogger:
    def __init__(self, environment: str = "dev"):
        self.table_name = TABLE_NAME.format(env=environment)
        self.dynamodb = boto3.resource("dynamodb", region_name="eu-west-1")
        self.table = self.dynamodb.Table(self.table_name)

    def log(
        self,
        patient_id: str,
        actor_id: str,
        action: str,
        resource_id: str,
        ip_address: str | None = None,
    ) -> AuditEvent:
        """
        Write an immutable audit event to DynamoDB.
        Never raises — logs error and continues to avoid blocking clinical flow.
        """
        event = AuditEvent(
            event_id=str(uuid.uuid4()),
            patient_id=patient_id,
            actor_id=actor_id,
            action=action,
            resource_id=resource_id,
            timestamp=datetime.utcnow(),
            ip_address=self._hash_ip(ip_address) if ip_address else None,
        )

        try:
            # Serialize to dict, converting datetime → ISO string for DynamoDB
            item = event.model_dump()
            item["timestamp"] = item["timestamp"].isoformat()

            self.table.put_item(
                Item=item,
                ConditionExpression="attribute_not_exists(event_id)",  # true immutability
            )
        except Exception as e:
            # Log to CloudWatch but do not raise — audit failure must never block care
            code = getattr(getattr(e, "response", None), "Error", {}).get("Code", type(e).__name__) if hasattr(e, "response") else type(e).__name__
            print(f"AUDIT_ERROR event_id={event.event_id} error={code}: {e}")

        return event

    @staticmethod
    def _hash_ip(ip: str) -> str:
        """Hash IP address — never store raw IPs per GDPR."""
        import hashlib
        return hashlib.sha256(ip.encode()).hexdigest()[:16]
