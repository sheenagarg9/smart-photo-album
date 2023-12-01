import json
import boto3

def lambda_handler(event, context):
    # TODO implement
    print(event)
    q1 = event['queryStringParameters']['q']
    print(q1)
    if(q1 == "searchAudio"):
        q1 = convert_speechtotext()

    print("q1:", q1)
    labels = get_labels(q1)
    print("labels", labels)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda Part 2!')
    }
    
def get_labels(query):
    lex = boto3.client('lex-runtime')
    response = lex.post_text(
        botName='SearchPhotos',
        botAlias='$LATEST',
        userId="Tamanna",
        inputText=query
    )
    print("lex-response", response)

    labels = []
    if 'slots' not in response:
        print("No photo collection for query {}".format(query))
    else:
        print("slot: ", response['slots'])
        slot_val = response['slots']
        for key, value in slot_val.items():
            if value != None:
                labels.append(value)
    return labels
