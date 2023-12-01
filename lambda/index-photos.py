import json
import logging
from os import environ
import boto3
import time
import requests

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
logger.setLevel(logging.ERROR)

def lambda_handler(event, context):
    s3 = event['Records'][0]['s3']
    bucketName = s3['bucket']['name']
    imageKey = s3['object']['key']
    
    image = {"S3Object":{"Bucket":bucketName, "Name":imageKey}}
    
    rek_client = boto3.client('rekognition')
    response = rek_client.detect_labels(Image=image)
    
    timestamp = time.time()
    
    labels = []
    
    for label in response['Labels']:
        labels.append(label['Name'])
    
    jsonArr = {"objectKey":imageKey, "bucket":bucketName, "createdTimestamp": timestamp, "labels": labels}
    
    print(labels)
    url = "https://search-photos-ya6zmaniwieqwp7qykoeal6vpa.us-east-1.es.amazonaws.com/photos/_doc"
    
    awsauth = ("sheenagarg9", "Sheenagarg9!")
    
    headers = {
        "Content-Type": "application/json"
    }
    response = requests.post(url,auth=awsauth, headers=headers, data=json.dumps(jsonArr))
    
    print(response.text)
    # TODO implement
    
    return {
        'statusCode': 200,
        'body': json.dumps(event)
    }
