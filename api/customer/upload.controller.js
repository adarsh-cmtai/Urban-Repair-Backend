const { generateUploadUrl } = require('../../services/aws.s3.service');

const getCustomerUploadUrl = async (req, res) => {
    try {
        const { fileType } = req.body;
        if (!fileType) {
            return res.status(400).json({ success: false, message: 'File type is required.' });
        }

        const { uploadURL, key } = await generateUploadUrl(fileType);
        const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

        res.status(200).json({ success: true, uploadURL, imageUrl });

    } catch (error) {
        console.error("Error generating customer upload URL:", error);
        res.status(500).json({ success: false, message: 'Server error while generating upload URL.' });
    }
};

module.exports = {
    getCustomerUploadUrl,
};