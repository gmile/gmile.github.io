---
layout: post
title:  The Rails State of Mind, part 1. Three stories
date:   2016-02-19 00:55
description: My first days with Rails
categories: development
published: true
---

By brining up these memories, I want to explore where, when and how the "seed was planted". I want to understand what resulted in me having the values I have right now. And, ultimately, how did I come to change my attitude against developing using Ruby on Rails, which I will explore in later posts.

So, here we go.

---

When in 2009 I first started reading 3rd edition of Agile Developer, I was still using Windows. I had some successful experience designing simple web pages in pure HTML/CSS (oh, I loved Macromedia/Adobe Fireworks!), but I had 0 experience in developing web application that implied interaction with user, like saving user’s input in DB, for example. I didn’t know anything about databases, what an application server is and how do I generate a private/public key pair. 

I was going to write a blog in Ruby on Rails. While on a paper, blog didn’t look like a hard task to tackle. You have what, posts, comments and categories? That sounds easy. Besides, I’ve heard that with Rails you can write a blog in 15 minutes. With that I knew I could easily get some help on the internet.

Running two scaffold commands to generate posts and comments didn’t take much time. I fell in love with code/boilerplate generators! It did so much for me. It was leaving me wondering what’s going on and how all these files generated relate to each other, but I didn’t pay much attention to it. “My Rails app probably needs all these files, so I better use generator whenever I can. Period”.

After following the guides, I finally got my blog working. I learned one thing out of that: I need to pay a lot of attention when I read guides. If I do something wrong, I will have to go a few steps back, remove the newly generated files and start all over by running the `rails generate` once again. Stepping aside from guides meant death.

I quickly realised I needed tags for my blog posts. But how the hell am I going to do that? How do I _tell_ Rails that I needed tags? To understand the implementation end-to-end, I wanted to implement tags from scratch but I didn’t know where to start. After googling and asking out, someone suggested I should just use this Rails plugin called [acts-as-taggable-on](https://github.com/mbleigh/acts-as-taggable-on).

I clearly remember I thought: “Hmm, shouldn’t I _understand_ how tags are implemented instead of just throwing this plugin in”? But hey, if Rails is a framework that essentially takes care of all the stuff I don’t need to write myself (like `link_to` helper and alike, as well as DB interaction, for examples), maybe there’s a _bigger framework_ in a sense that I no longer need to write simple things like tags.

I continued to jump to conclusions. What if everything has been _already written_, and web development boils down to just combining existing libraries so you barely even have to implement anything yourself.

There was a lot of cognitive load already, so I finally settled with using the gem. Maybe this is how real world web development is done these days: you have a framework, you have gems/plugins, you combine them and there you go, you’ve built an app!

I clearly remember there was something irrational about this process of learning. I felt like I was a superhero from a movie. I would use a code generator to quickly get scaffolding for a new feature/piece of functionality, and would throw in gems whenever I wanted functionality like tags or a tree of categories. It seemed like I was getting all this for free.

I wondered: wasn’t there some catch here? Shouldn’t I be paying some price for all I’ve got so easily? I didn’t know what to think and just took things for granted.

---

It was February 2010. I was hired as a web developer to work on a Rails project. After two weeks for sitting on a bench and trying to work on some random weird stuff, I was finally assigned a real project. My first task was to finish implementation of authentication system. Thre was some related authentication code checked in the SVN. Apparently someone before me tried to do this, but ultimately failed. It all boiled down to this: add authlogic gem and make a successful login.

I had to work in Ubuntu, but I didn’t even know what a home folder was, where exactly my files are, and how do I list the contents of directory. Ubuntu terminal scared the shit out of me. To make matters worse: I was running Ubuntu in a Virtual Machine. On a very slow laptop my parents bought me in 2007. It was really shitty day.

I couldn’t make the gem work as intended. I read and re-read the Readme, the thing didn’t work: It would refuse my password no matter what. I followed the Readme really closely couple of times, each time completely wiping all authlogic contents from the project: migration, and other files. I felt extremely sad to the point I thought I won’t come back to work the following day.

A senior co-worker asked me if I was doing OK. I replied I was not. He asked me what I accomplished so far, and I remember saying: “Well, I’ve watched Ryan Bates’s screencast 6 times by now…”. He burst in laugh. I bitterly laughed too.

It took me ages until something clicked. While looking at DB schema, I noticed this `crypted_password` field. For some reason, in schema.rb we had a char limit set on it. There was no char limit in any of the guides I’d look at tens of times by now. So I removed it.

After cleaning up this mess and rebuilding it from scratch, authlogic gem finally worked. I was so proud of myself, as if I accomplished really, really hard. It felt like magic. But more importantly, I felt like I finally understood _it all_! If only I knew how wrong I was at the time.

---

A few more weeks into professional web development, I am assigned a task to cover some existing code with tests. Yuck. But I think  most of us have been there.

Every time he was passing by, we would strike a conversation along the following lines (in this instance we were talking about a test for a Rails controller):

- Hmm, so I put `stub` here, and it will… what? When I run the test, it will appear there, _in another file_?
- Yes.
(I put stub)
- Oh, no, you should put stub before “get"...
- Okay. Sorry, can you remind me what am I stubbing again?
- You’re stubbing this call on that object.
- Hmm, right. And what will that do?
- Well, the controller action will execute this code, and since it’s stubbed, it will return whatever you want.
- And what do I want?
- You want to return a mock object that “knows” this another method...
- Oh, crap. Okay. And why do I need to stub this another method?
- Well, you need to make the execution to go on. And if you don’t stub, the execution will stumble, trying to do actual operation on an object.

Back then my fellow senior developers were far away from good practices, resulting in our controllers being super fat. This led to severe spaghetti code in test. It usually took me hours to finish a single test!

Suprisingly, it didn’t feel wrong. I seemed fair. I thought it was OK for it to be that tough. I thought that was what the world of grownup developers really looked like, that things were supposed to be complicated there. I got paid for working on those things, so it all was probably the way it should be.

Feature tests were another issue. We didn’t know about database_cleaner gem, and capybara was yet to become industry standard for browser testing. I think we used webrat / selenium in conjunction with cucumber. Every time I needed to run feature tests, I saw a browser window. The tests would fail sporadically. Running tests would feel extremely fragile, to the point that green tests would raise questions rather than a relief. Often it’d take me a day to finish a test.

Overall, that testing experience turned out to be traumatic. I grew to hate tests. TDD seemed ridiculous! No, really: who in their right mind would possibly go through this masochism of thinking spaghetti-wise like that, before actually writing any code?! I think even today It’s hard for me to do TDD approach mainly due to that experience.

It took 2 years before I restored my faith in tests. But that’s a completely different story.

---

Many thanks to my friend [Alexei Sholik](https://github.com/alco/) for proofreading the post!
