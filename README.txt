Architecture:

headline-fights-fe
headline-fights-api
headline-fights-db
headline-fights-s3

This API keeps a master document in the db of all of the headline statistics for quick recall. To run the app properly, a new HeadlineStat document must be inserted in the db with all number fields initialized to 0, and its object ID must be saved in .env.

TODO:

Store images in Amazon S3 -> https://aws.amazon.com/s3/pricing/?loc=ft#AWS_Free_Tier









