import * as AWS from 'aws-sdk'


export const ReadTable = async (tableName) => {
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: tableName,
  };

  let items = [];
  let lastEvaluatedKey = null;

  do {
    const data = await docClient.scan(params).promise();
    items = items.concat(data.Items);
    lastEvaluatedKey = data.LastEvaluatedKey;
    params.ExclusiveStartKey = lastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
};


export const WriteTable = async (tableName, items) => {
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: tableName,
    Item: items
  };

  try {
    await docClient.put(params).promise();
  } catch (err) {
    console.error("Error while writing data:", err);
    throw err;
  }
};

export const UpdateTableItem = async (id) => {
  const docClient = new AWS.DynamoDB.DocumentClient();
  const updateExpression = 'SET visible = :visibility';
  const expressionAttributeValues = { ':visibility': "False" };

  const params = {
    TableName: "db_centers",
    Key: {
      'id': id,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  try {
    const updatedItem = await docClient.update(params).promise();
    return updatedItem.Attributes;
  } catch (err) {
    console.error("Error updating visibility:", err);
    throw err;
  }
}

export const GetPhoto = async (photoName) => {
  const s3 = new AWS.S3();
  const params = { Bucket: 's3-statistics', Key: encodeURIComponent(photoName) };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        console.error('Error getting S3 URL:', err);
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
};

export const GetPhotoThemes = async (photoName) => {
  const s3 = new AWS.S3();
  const params = { Bucket: 's3-aiqthemes/man', Key: encodeURIComponent(photoName) };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        console.error('Error getting S3 URL:', err);
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
};