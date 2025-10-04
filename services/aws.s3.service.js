const AWS = require('aws-sdk');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);

const region = process.env.AWS_S3_REGION;
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: 'v4'
});

const generateUploadUrl = async (fileType) => {
    const rawBytes = await randomBytes(16);
    const imageName = rawBytes.toString('hex');
    
    const fileExtension = fileType.split('/')[1];
    const key = `${imageName}.${fileExtension}`;

    const params = {
        Bucket: bucketName,
        Key: key,
        Expires: 60, // URL is valid for 60 seconds
        ContentType: fileType
    };

    const uploadURL = await s3.getSignedUrlPromise('putObject', params);
    return {
        uploadURL: uploadURL,
        key: key
    };
};

const deleteFromS3 = async (key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
    };

    try {
        await s3.deleteObject(params).promise();
    } catch (error) {
        console.error("Error deleting from S3:", error);
    }
};

module.exports = { generateUploadUrl, deleteFromS3 };