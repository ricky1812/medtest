const AWS = require("aws-sdk");
const S3 = require("aws-sdk/clients/s3");

const { AWS_ACCESS_KEY_ID, AWS_SECRET_KEY, REGION, BUCKET } = process.env;
const s3url = "https://medinery.s3.us-east-2.amazonaws.com/";
const EXPIRES = 60*15;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_KEY,
  region: REGION,
});

const s3 = new AWS.S3();

module.exports.imageUpload = (path) => {
  const data = {
    Key: path,
    Bucket: BUCKET,
    Expires: 60 * 60,
    ACL: "public-read",
  };

    let upload_url = s3.getSignedUrl("putObject", data);
    let download_url = s3url + path;

    return {
      upload_url: upload_url,
      download_url: download_url
    }
};

module.exports.getGetUrl = (path) => {
  console.log("Generating GET URL");
  return s3.getSignedUrl('getObject', {
    Bucket: BUCKET,
    Key: path,
    Expires: EXPIRES
  });
}

module.exports.getPutUrl = path => {
  console.log("Generating PUT URL");
  return s3.getSignedUrl('putObject', {
    Bucket: BUCKET,
    Key: path,
    Expires: EXPIRES
  });
}
