const AWS = require('aws-sdk')
const sharp = require('sharp')
const {promisify} = require('util')


AWS.config.update({region: 'us-east-1'})

s3 = new AWS.S3()

exports.handler = async (event) => {
    let filesProcessed = event.Records.map( async (record) => {
        let Bucket = record.s3.bucket.name
        let Key = record.s3.object.key

        const bucketParams = {
            Bucket,
            Key
        }
        
        let inputData = await s3.getObject(bucketParams).promise()
        console.log('got file')
        
        
        const srcData = inputData.Body
        
        const resizedData = await sharp(srcData).resize(200).toBuffer()

        const targetFilename = Key.substring(0, Key.lastIndexOf('.')) + '-small.jpg'
        var uploadParams = {
            Bucket,
            Key: targetFilename,
            Body: new Buffer(resizedData),
            ContentType: 'image/jpeg'
        }
        console.log('about to try upload')
        await s3.putObject(uploadParams).promise()
        return

    })

    await Promise.all(filesProcessed)
    console.log('done')
    return 'done'
}

