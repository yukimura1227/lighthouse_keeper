import AWS from "aws-sdk";

async function setupTables() {
    const dynamo = new AWS.DynamoDB({
        endpoint: 'http://localhost:8000',
        region: "ap-northeast-1",
    });

    const createTableInput = {
        TableName: "Test",
        AttributeDefinitions: [
          {
            AttributeName: "Id",
            AttributeType: "S",
          },
        ],
        KeySchema: [
          {
            AttributeName: "Id",
            KeyType: "HASH",
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
         },
    };

    try {
        // テーブルを作成
        const response = await dynamo.createTable(createTableInput).promise();
        console.log(response);
    } catch (e) {
        console.error("テーブル作成失敗", e);
    }
}

setupTables();
