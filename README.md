# NC News Seeding

The following command may need running first to start the PostrgreSQL server in order for the psql command to work: 

sudo service postgresql start


To run the repo locally, You need two enviroment files. 

.env.test
.env.development

Instructions for set up:

env.test:

1. Create a env.test file
2. Add the following into the file - PGDATABASE=your_test_database_name  


env.development:

1. Create a env.development file
2. Add the following into the file - PGDATABASE=your_dev_database_name


ps. Replace `your_test_database_name` with the name of your local test PostgreSQL database (e.g. `nc_news_test`)

Make sure .gitignore file has .env.* so that files aren't pushed to github.

RUN `npm run setup-dbs` to create both a test and development database afterwards.

Should return a message in the terminal saying connected to `database_name`.


**additional information**

If you are having a password authentication error follow the below instructions

1. in the terminal enter psql
2. ALTER USER `my_user_name` with password `'my_secure_password'`;
3. Will return ALTER USER if password is changed
4. Return to root directory using the cli command cd
5. Create a .pgpass file using `touch .pgpass`
6. Open the new txt file .pgpass on vscoder
7. write a single line of `*:*:*:*:mypassword` 

Change mypassword with the password you have set.

When you run psql it should now use this password as a default so you don't have to provide one on every command.



