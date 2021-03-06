import AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";

async function setupTables() {
    AWS.config.update({
      credentials:  new AWS.Credentials(
        "local",
        "dummy"
      ),
      region: 'ap-northeast-1',
    })
    const dynamo = new DynamoDB({
      endpoint: 'http://localhost:8000',
    });

    const createTableInput = {
        TableName: "Test",
        AttributeDefinitions: [
          {
            AttributeName: "UUID",
            AttributeType: "S",
          },
          {
            AttributeName: "DataGroupKey",
            AttributeType: "S",
          },
        ],
        KeySchema: [
          {
            AttributeName: "UUID",
            KeyType: "HASH",
          },
          {
            AttributeName: "DataGroupKey",
            KeyType: "RANGE",
          },
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
