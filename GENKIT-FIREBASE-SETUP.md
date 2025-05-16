# BlinderFit Genkit Firebase Telemetry Setup Guide

## Overview
This guide explains how to set up Firebase telemetry for your BlinderFit project, which will allow you to monitor and analyze your Genkit AI operations directly in Google Cloud.

## Installation
1. The `@genkit-ai/firebase` plugin has been installed in your project.
2. The necessary code changes have been made to integrate the telemetry into your existing Genkit configurations.

## Required IAM Permissions
To enable proper telemetry collection, you must grant the following permissions to your Firebase service account:

1. Log in to your [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "IAM & Admin" > "IAM"
3. Find the "Default compute service account" which will look like: 
   `[PROJECT-ID]@appspot.gserviceaccount.com`
   
4. Add the following roles to this service account:
   - Monitoring Metric Writer (`roles/monitoring.metricWriter`)
   - Cloud Trace Agent (`roles/cloudtrace.agent`)
   - Logs Writer (`roles/logging.logWriter`)

### Step-by-step instructions:

1. Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)
2. Make sure you're in the "blinderfit" project
3. Find the service account ending with `@appspot.gserviceaccount.com`
4. Click the pencil icon to edit roles
5. Click "Add another role"
6. In the "Filter" field, type "Monitoring Metric Writer"
7. Select the role and click "Save"
8. Repeat steps 4-7 for "Cloud Trace Agent" role
9. Repeat steps 4-7 for "Logs Writer" role

## Viewing Telemetry Data

After setting up the permissions and deploying your functions, you can view telemetry data in:

1. **Google Cloud Monitoring**: https://console.cloud.google.com/monitoring
   - Check dashboards for custom metrics from Genkit

2. **Cloud Trace**: https://console.cloud.google.com/traces
   - View detailed traces of your AI operations

3. **Cloud Logging**: https://console.cloud.google.com/logs
   - Search for logs related to your Genkit operations

## Testing Telemetry Collection

To verify telemetry collection is working:

1. Invoke one of your Genkit-powered functions:
   ```javascript
   // Example client-side code
   const answerQuestion = firebase.functions().httpsCallable('answerHealthQuestion');
   const result = await answerQuestion({ question: "How can I improve my running endurance?" });
   ```

2. Wait a few minutes for telemetry data to appear in Google Cloud Console

3. Check Cloud Monitoring for new metrics

If telemetry isn't appearing after 15-20 minutes, verify the IAM permissions were added correctly.

## Best Practices

1. **Monitoring**: Create alerts for unusual patterns in response times or error rates
2. **Cost Management**: Monitor your usage to manage costs effectively
3. **Performance**: Use trace data to optimize slow-performing functions

## Troubleshooting

If telemetry data isn't appearing:

1. Verify IAM roles are correctly assigned
2. Check Cloud Functions logs for any permission errors
3. Ensure functions are being invoked successfully

For more assistance, refer to the [Genkit Firebase Plugin documentation](https://github.com/genkit-ai/genkit/tree/main/packages/firebase).
