#!/bin/bash
# GCP STAGING SETUP — Strategic Minds Swarm OS Event Router
# Run this with: bash gcp_setup.sh
# Needs: gcloud CLI installed + authenticated

set -e
PROJECT_ID="strategic-minds-swarm-os"
REGION="us-east1"
SA_NAME="swarm-event-router"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
SERVICE_NAME="swarm-event-router"
REPO="Strategic-Minds/AUTO_BUILDER"

echo "=== GCP STAGING SETUP — Swarm OS Event Router ==="
echo "Project: $PROJECT_ID | Region: $REGION"

# 1. Create or use existing project
gcloud projects create $PROJECT_ID --name="Strategic Minds Swarm OS" 2>/dev/null || echo "  Project exists — using it"
gcloud config set project $PROJECT_ID

# 2. Enable required APIs
echo "[1/6] Enabling APIs..."
gcloud services enable pubsub.googleapis.com run.googleapis.com secretmanager.googleapis.com cloudbuild.googleapis.com

# 3. Create service account
echo "[2/6] Creating service account..."
gcloud iam service-accounts create $SA_NAME \
  --display-name="Swarm Event Router" \
  --description="Routes events between swarm agents" 2>/dev/null || echo "  SA exists"

# 4. Grant IAM roles
echo "[3/6] Setting IAM..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/pubsub.subscriber" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/pubsub.publisher" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.invoker" --quiet

# 5. Create Pub/Sub topics (7)
echo "[4/6] Creating Pub/Sub topics..."
for TOPIC in "agent.events" "agent.commands" "agent.receipts" "agent.memory.write" "agent.approvals" "agent.alerts" "agent.deadletters"; do
  TOPIC_SAFE=$(echo $TOPIC | tr '.' '-')
  gcloud pubsub topics create $TOPIC_SAFE 2>/dev/null || echo "  Topic $TOPIC exists"
done

# 6. Store Supabase key in Secret Manager
echo "[5/6] Storing Supabase key in Secret Manager..."
echo -n "$SUPABASE_SERVICE_ROLE_KEY" | gcloud secrets create supabase-service-role-key \
  --data-file=- 2>/dev/null || \
  echo -n "$SUPABASE_SERVICE_ROLE_KEY" | gcloud secrets versions add supabase-service-role-key --data-file=-

gcloud secrets add-iam-policy-binding supabase-service-role-key \
  --member="serviceAccount:${SA_EMAIL}" --role="roles/secretmanager.secretAccessor"

# 7. Deploy Cloud Run event router
echo "[6/6] Deploying Cloud Run service..."
gcloud run deploy $SERVICE_NAME \
  --image=gcr.io/google-appengine/nodejs20 \
  --region=$REGION \
  --service-account=$SA_EMAIL \
  --set-env-vars="SUPABASE_URL=https://prhppuuwcnmfdhwsagug.supabase.co" \
  --set-secrets="SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest" \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --port=8080 \
  --quiet

# Get Cloud Run URL
ROUTER_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
echo ""
echo "✅ Cloud Run URL: $ROUTER_URL"

# 8. Create push subscription for agent.alerts → Cloud Run
gcloud pubsub subscriptions create agent-alerts-router-sub \
  --topic=agent-alerts \
  --push-endpoint="${ROUTER_URL}/route" \
  --ack-deadline=60 \
  --message-retention-duration=7d \
  --dead-letter-topic=agent-deadletters \
  --max-delivery-attempts=5 2>/dev/null || echo "  Subscription exists"

echo ""
echo "════════════════════════════════════"
echo "GCP STAGING SETUP COMPLETE"
echo "Router URL: $ROUTER_URL"
echo "Test with:"
echo "  curl -X POST $ROUTER_URL/route \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d @/tmp/awos-event-router/tests/qa_regression_fixture.json"
echo ""
echo "Then verify in Supabase:"
echo "  agent_inbox: should have 1+ rows WHERE event_type='qa.regression.detected'"
echo "  bridge_receipts: should have delivery receipt"
echo "════════════════════════════════════"
