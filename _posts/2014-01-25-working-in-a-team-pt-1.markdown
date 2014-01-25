---
layout: post
title:  Working in a team. Part 1
date:   2014-01-25 00:46:00
categories: development
---

### Feedback from other developers

For a long time in the past, I've been taking the majority of comments regarding my code from my colleagues too personally. It took me a really long time to recognize the main thing in it – [I am not the code I write](http://sstephenson.us/posts/you-are-not-your-code), i.e. the comments I receive are about my code, and not about my personality.

For me, it was crucially important to take a different view on criticizing: **instead of criticizing a person, one must criticise he's deeds**. Though, the rule may be alleviated by a quote from Napoleon:

> Never criticize another man's deeds unless you know why he performed them. The chances are you would have done the same under the same circumstances.

After taking a different view on criticism, it didn't take long for me to realise another important thing: **every time someone talks about my work he, in fact, does me a big favor**. Not only he points out a problem with what I've written, but he implicitly teaches me not to make the same mistake again.

Asking for more background behind comments and suggestions is essential. As a side effect, it’ll became easy to validate the knowledge of the commenter: if he asks PR owner to fix something just due to his matters of taste, I put a mental -1 to his professionalism and reach out to other people's opinions.

Accepting other’s opinions on your work, and thus admitting you did bad is hard and definitely requires to be an open-minded person. But after all, it's learning and thusit is good for you. At the end of the day, your teammates are here to help you, not to bully you. It is important to remember that **you all play on the same team, striving to make a better product**.

### Running ideas by other developers

A few times in my life I've been in a situation, where I thought I absolutely knew what I was doing, when in fact I did not. Being exactly sure I was doing the right thing led me to immediately start coding the problem's solution. The truth of it was – after several days of work I realized I had done a huge mistake when planning the solution path. I would then figure out I had overlooked something very important in the beginning, and now by no means that mistake would let me move on.

This usually had three costs:

* client had to pay (like in spend real money) for my mistake,
* the team had to pay the cost of my mistake by turning into a crunch mode,
* most importantly, I had to pay my own mental cost by stressing out, which is never a healthy thing.

It's too easy to dig yourself a hole you won't be able get out from. I realised that I no longer wanted to pay the costs of stressing out. Stress was something I absolutely couldn't afford, since recovering for me was always long and painful.

I concluded that the only way to save my ass would be to run ideas by other team members early. Now, if I had 3 days to solve a problem, I would spend 2 days drafting out my thoughts and asking other people whether the path I was about to take looked good, rather than diving into coding right away.

If you feel solving the problem will require a huge amount of changes to be introduced, always write down your thoughts on a gist (or something similar; the main point here is to share the thing easily and securely) to then show it to other people before getting to the actual coding. Take a look at a few good examples: [Distinguishing between redirect/afterModel](https://gist.github.com/machty/7676934), [Linker overhaul](https://docs.google.com/document/d/1xN-g6qjjWflecSP08LNgh2uFsKjWb-rR9KA11ip_DIE/edit), etc.

This has a few key advantages:

1. you're securing yourself from the situation on the later stage of implementation, when it becomes apparent you got it all wrong,
2. almost always other people can find flaws in your solution rather quickly,
3. the gists with your ideas are very likely to become a contribution to the project documentation,
4. you spread the knowledge by helping other people to understand the modules you are working on, since **by no means you can be a single point of failure in this part of the application**.

### Measure thrice and cut once

Even though everyone has confirmed that your proposal to the problem's solution looks correct, after the code is written you may run into a situation where, as it turns out, the initial problem statement was incorrect. Either the requirement itself may have had a big flaw in it, or it may have been misinterpreted by someone in the chain of people between you and the person who came up with the requirement.

The costs, you thought you had successfully avoided would now have to be payed.

I used to think it's someone else's fault, and not mine. Luckily, I had been [wrong](http://sivers.org/my-fault).

Given we're all playing on a single team, struggling to make a better product, it is our duty to help each other clarify things for us, instead of simply putting the blame on any one person.

Sometimes, analyzing requirements for a few hours helped me understand there was a huge flaw, overlooked by the person who wrote them. Since I now had enough context, all I had to do was to explain why something could not be accomplished the way it had been requested. Unfortunately, oftentimes explaining wasn't that easy.

After a few unsuccessful attempts to explain the problem I have come up with a list things that can help other person understand me better:

1. best start with a few real world examples why something won't work,
2. a picture paints a thousand words: draw schemes, create layouts or take screenshots depicting data, that serves best to depict the problem,
3. come up with a few options to solve the problem,
4. commit to clarify every detail of the bigger picture, which will very likely result in replacing requested feature with another one, that'd fulfill the requirement,
5. always use simple english.

From my experience, the quickest way to get the clarification work done is to **do 95% of it yourself, leaving your respondent with only 5%**.

As a bonus track, I highly recommend reading on why only [fools write code first](http://blog.reemer.com/why-only-fools-write-code-first).

### Stay on the record

A few months after the feature had been released and feedback was gathered, it is very likely that the feature will have to be changed. At this point there's absolutely no guarantee the task to perform the change will be assigned to the same person. But even if so – one may have already forgotten why in the world he has made certain decisions when implementing it.

I take the importance of keeping the history of communication to its extreme. Very often in my life certain, very confusing parts of the code were quickly clarified by just searching the Campfire history.

Ideally, all the communication within the team takes place within Campfire, Pivotal Tracker and a git log (pick similar tools of choice).

In my next post I'll take a deeper look at how git log, being one of the best tools to communicate, serves to keeping things on the record.
