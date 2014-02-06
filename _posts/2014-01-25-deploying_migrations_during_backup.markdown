---
layout: post
title:  Deploying migrations during backup
date:   2014-01-25 12:57:00
categories: development
---
I've ran into this probalem the other day – after running `cap production deploy:migrations` the `cap` output had stuck on running the migrations step. Before calling Chip and Dale, I descided to take a closer look at what was going on.

###  The problem

Here's the steps I did to understand why my deploy stuck on attempt to run migrations.

1. logged into server with production database,
2. ran:

  ```bash
$ psql my_production_database -c "SELECT datname,procpid,current_query FROM pg_stat_activity;"

            datname        | procpid |                        current_query                        
-----------------------+---------+-------------------------------------------------------------
my_production_database |   10312 | <IDLE>
my_production_database |   12345 | COPY select * from some_really_big_table ... TO STDOUT;
my_production_database |   54321 | <line_from_one_of_my_rails_migrations>
my_production_database |   14123 | SELECT datname,procpid,current_query FROM pg_stat_activity;
  ```

4. there was something curious with `COPY select * from some_really_big_table ... TO STDOUT;` – why is it even being run during migrations? Clearly, this line had nothing to do with my migrations.

###  The solution

First off, why `... TO STDOUT;`? In fact, the `... TO STDOUT;` is a good hint itself: at the moment of running the first of my migrations, the database backup was still running, triggered by cron:

```
0 15 * * * pg_dump my_production_database | gzip /home/my_project/my_production_database_backup.sql.gz
```

Apparently there were two ways out:

1. **Wait until backup finishes**. This would be much more preferable way of resolving the issue, yet not for me. In my case a regular backup is 20Gb (8Gb compressed), and, what was even more depressing the backup process was at it's very early stage. In order to approximately find out current progress of a backup, one may go with two options:
  1. if you already know the approx. timeframe the backup generation finishes at, calculate current running time by subtrackting current servers time from the time the backup starts (inspect `crontab -l` for that)
  2. if you don't know the approx. time, but you have your server under a New Relic (or similar service) provisioning, you can get to know that (as well as approx. current progress) by looking at the server load during backup from the previous days. Here's how it looked for me: <image>
2. **Kill the backup process**. In my case, the backup finished in approx. 5 hours, and it was running for only an hour by the time I was investigating the problem. So here's what I did:

  1. kill the backup process (it will make the `cap` command finish with failure, but that's ok):
      
      ```bash
$ sudo kill -9 12345       
      ```

  2. go to the folder, where capistrano keeps all the project releases. For me it was:

      ```bash
cd /var/projects/my_project/releases/
      ```

  3. refresh the symlink (this is usually done by capistrano itself, yet now we have to do it manually, since cap command finished with a failure):

      ```bash
      ln -s /var/projects/my_project/releases/20130613155542/ current
      ```

  4. move inside the `current` directory:

      ```bash
      cd /var/projects/my_project/releases/current
      ```

  5. check the status of migrations, that ran so far (optional):

      ```bash
      RAILS_ENV=production rake db:migrate:status
      ```

  6. run the migrations:

      ```bash
      RAILS_ENV=production rake db:migrate
      ```

  7. restart the application:

      ```bash
      touch tmp/restart
      ```

All done now! Of course, the rule of thumb should be: do not deploy while having DB backup in progress.
