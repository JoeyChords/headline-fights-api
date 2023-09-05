Architecture:

headline-fights-ui
headline-fights-api
headline-fights-db
headline-fights-s3

TODO:

Store images in Amazon S3 -> https://aws.amazon.com/s3/pricing/?loc=ft#AWS_Free_Tier

Use JWT json token to determine if a user is logged in.

Route to update times_correctly_chosen in headlines, then corresponding fields in users.

Route to return averages of each publication for fear mongering, incendiary, race baiting, caring, happy, informative, truthful, misleading, clickbait. Is article opinion or fact? 
Republican or Democrat?

To check and see if the user has rated that one yet, use find for user and headine id and check if null. 

Homepage not signed in gives user stats for each publication and heaadline with rating option. All clicks lead to login/signup.

pub1 and pub2 on 2 sides of screen with just recognizability and negativity score bars underneath. Clicking either give full stats breakdown with score bars.

signed in user sees own choices vs community choices. Just score bars on top of each other. Out of 100 percent, the percentage of times they chose those things.

