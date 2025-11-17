Robert Boulos | 00:00
Hi. Ashley. Hey, how are you?
Speaker 2 | 00:03
Engyed. Happy Halloween.
Robert Boulos | 00:05
Happy Halloween. Very true. I forgot. Actually, spooky, I am happy to help and I'm just taking a look at some of the stuff that was mentioned. I actually made a lot of hope. I don't know if you know it's from your side, but I did want to lift up the touches in the app, like the visual appearance of it. I don't know if it was apparent at all, but there were some things about it that I felt could look better just while I was in there anyway.
So now it should just be nicer in dark mode and have some of those touches, like the column headers, how they were dark before, but now they're light. You can read them. I revisited all the badges and all that stuff was just bothering me. I was just looking at it. I'm like, "We can just try to make sweeping upgrades in that area."
And.
Speaker 2 | 01:09
Nice meeting you.
Robert Boulos | 01:10
And the searching by job should be working. Now, let's actually take a look and we can confirm.
Speaker 2 | 01:18
Okay. Cool.
Robert Boulos | 01:28
Let's see.
Here. Actually, let me just turn this on floor.
Speaker 2 | 01:57
Wa if I scre her?
Robert Boulos | 01:59
Yeah, for sure. Please go for it. Yeah, and yes, so go ahead. I was actually just gonna say that. I made the thing that, like, when you switch between screens now, it doesn't go completely white anymore and then come back here. I made it so that it fades, keeps it...
It's just less jarring. I found. So, yeah, I mean, it's still a bit despairing for it, but just blurs it away, brings it back. And as I'm clicking through the feed source, actually, it shows that it has 28,000 records.
Then, as you click through the feed source, it's actually now searching through and then pulling back everything that has to do with that particular feed source. So it should be working as far as I can tell from the testing.
But that's what I just wanted to confirm with you if it's working the way you expect. Or if there is something that I should adju.
Speaker 2 | 03:06
Yeah. cool. So let's see if there's nothing here. So I take them, mying. We don't have a feed right now. So, I think if I'm remembering correctly, because I know sometimes it pulls up, sometimes it feels like it's not pulling up relevant jobs. That there's something in the information that connects it.
Robert Boulos | 03:37
Yeah, because it's going so the way that it even searches is, well, it depends. Let me take a quick look at your screen right now. So when we're here in the company...
If you can, just refresh the page and then we'll see. Then we'll click on where it says feed source for Appcast. Then I just wanted to make sure just from this side. So right now it's 6,507 records.
But if you click onto any of the other dropdowns from that list, then it should be just returning back everything to do with just that particular feed source. So if you then go back to the right, if you scroll, but they move the window over so the chart just shows the right side of the screen.
Then, if we look at feed source, then it should be all the same feed source. Sorry if you move back to the left, just for these badges down here. So this should be all the same feed source. Let me double-check for a buyer.
So what's happening is that it's showing two feed sources at once because we have two selected. I think. No, never mind, that's weird, it's not showing on.
Speaker 2 | 04:55
I think when he double-checked. I think buyer falls under Acast. I don't know if that.
Robert Boulos | 05:03
I see what's happening. That's interesting. Actually, it works.
Speaker 2 | 05:09
Myself. Yeah.
Robert Boulos | 05:12
It's just... I think I have to just adjust it a little bit so that it doesn't necessarily keep the previous first selected one. I can see that when I'm selecting it.
If I start to choose one, two, three, and then I get rid of a couple of them, then it starts to get confused. But if I just come in with the intention of like, I want the buyer specifically and then as the first action, then it tends to give that to me.
But I'm going to just then investigate this. So this is good. I will refine that, but the concept is there. It works in the sense that, right now, what it does is specifically take that term and go through all of the jobs in the entire database and then say, "I want everything that matches with Appcast and then just bring it back specifically."
So it's cutting through that problem of visibility. But I'm just going to refine it so that it's a bit more robust. So, as you're clicking, maybe switching between views. So if anything...
So I'll look out for that. But if there's anything inconsistent from your side, then, please let me know and I'll refine it so that it's solid. To answer the question about the last seven days, there were no worries.
Speaker 2 | 06:40
Sorry. Just sorry, I have questions. So you're saying that currently, when we're selecting new fees, the system's getting confused and keeping the first fee. So that's something you're going to look into.
Robert Boulos | 06:56
Yeah, to be honest, it's only ever happened, like literally now, I do tend to click and I'll switch it. It's surprising to me that it's behaving this way now, but I'm so... I'm not.
Speaker 2 | 07:10
Because I did think earlier, I was selecting different feeds and that wasn't happening.
Robert Boulos | 07:10
Hundred percent.
Speaker 2 | 07:14
Like, don't even actually... I think all of these came up with no jobs, which I was like, "I don't know if there are jobs in these, so I can't say if that's right or wrong.
Robert Boulos | 07:22
Exactly. Some of them have no jobs. Because the way that it's pulling is this list will pull from the entire list of partners that you have.
So that you don't have to update this list right into the future, that it'll just automatically pull. So yes, some of them will have... You might have a partner, but you don't have any jobs for that partner. This one, if we move the screen over to the right just a little bit, then we'll see...
Okay, perfect. So this is at least showing recruits CPC, okay? So that's what I just wanted to see, but there's no buyer, so that's fine, that's good. Then that makes sense actually. Do we have more?
Speaker 2 | 07:59
I think we have gotten our jobs, though. Let me ask... Summary.
Robert Boulos | 08:03
Yep, for sure, no worries. Fire and fertone.
Speaker 2 | 08:18
Okay. And then the first thing we were testing was the search functionality. And so that I believe, has like been kind of hit or miss.
Robert Boulos | 08:29
Yes.
Speaker 2 | 08:32
And I feel like you've explained why, but, like.
Robert Boulos | 08:37
I see, yes. Okay, let me actually start, because as you're telling me, then I can just think of things that I can just experiment with. But, yeah, please keep telling me and I can see what I can do from my side.
Basically, it seems like it's not necessary. Is it still displaying that issue where sometimes you search for, like, "chief financial officer," and then it doesn't necessarily bring back CFOs? It'll bring up a director of catering or something.
Speaker 2 | 09:06
Sometimes it doesn't really seem to pull in relevant jobs at all. So, I'll search for "nurse," and then let's see what comes up. Okay. So this... Actually, this happened earlier. It seemed like I couldn't search jobs when I had this feed source.
But then I reset it because you noticed the page didn't change at all.
Robert Boulos | 09:27
I see, that's interesting.
Speaker 2 | 09:29
So when I reset it, that stopped, though.
Robert Boulos | 09:35
I see. Okay, that's really interesting because there are actually two different things happening at once, and that's actually really good.
Speaker 2 | 09:39
But. it's.
Robert Boulos | 09:44
This is interesting because I didn't anticipate this in the sense of the one search on the top left is searching through all the jobs, but then the drop-down feed for the job feed is searching through all the jobs.
So those are actually two. I have to think about this for a second because I see what you mean. You're filtering down by job feed, but then we want to further search through those obviously. So it's a double search.
That is... That's actually... I just want to think of the easiest way to do that because we have everything to do that. I just have to arrange it in my head. But that's a really interesting thing to think about. Filtered down.
Yeah, please keep going. There's a solution.
Speaker 2 | 10:39
The search itself seems to be head and miss to me. So, I searched for "nurse," but I always see "nurse" come up once. So I guess... We definitely have other nursing jobs, but maybe they're listed...
Well, actually, let's just see what the app pulls up if I pull up "nurse dogs." Maybe they're, like, listed as, like. Yeah, so like, there are other job titles with nurse. Okay, at least, you know, so.
Robert Boulos | 11:12
But I'll check that as well, because I think that I know a way we can make that better, too. But yeah, this is... So when you're searching, it's popping up some "nurse" jobs, but not...
Okay, "nurse" mental health. Okay, I see what you mean. It's not really "health", but it's not really "nurse". Physicians and there are others that match, probably more accurately. I'm just checking a different type of search right now on my side to see if we get better results with another type of search, which I think we can. This is going to be a "healthcare" job description.
Yeah, okay, this could work. Okay, let me see if I can implement something on my side from here, but I think we can. Okay, so searching by "job feed" and searching further by "TED". But let's just do the... Let me try to get some quick wins. I think that we can get the searching improved right now. Search all jobs.
Alright, let me see if I can get that fixed. Okay, so you want to search through the jobs more effectively, and I'll work on that, but yeah, please. Is there anything else that stands out to you from this view?
Speaker 2 | 13:41
This is just my list of things to talk to you about, so otherwise, I don't... Maybe I'll just hit on them all real quick and then you can echo whatever you want.
Robert Boulos | 13:49
Yeah, for sure.
Speaker 2 | 13:51
So, feed-wise... I actually first brought it up because we just launched a partnership with the Direct Employers Association. And I don't see their feeds in here.
Robert Boulos | 14:01
I.
Speaker 2 | 14:03
That I'd love to look into that. And then separately, you brought up the last seven days thing, so I did want to talk about that. I wanted to touch base again on the curated date.
Robert Boulos | 14:22
Yes.
Speaker 2 | 14:23
Because let's say, I was checking to see which jobs closed that had been curated this week and nothing was coming up.
Robert Boulos | 14:31
Okay, I need to fix this. No, you're right, this is actually not a surprise. I see what you mean. I need to actually add in a... Basically, the easiest fix is all I need to do is just basically add in an extra piece of data to the backend that simply whenever it changes into that closed, published, or approved, we're actually storing the current timestamp.
It's just because there's actually... I've realized that the time that we're actually trying to display, obviously, is different for each of these things. So whenever that event happens, I need to just associate that we're storing a timestamp.
So that's actually before the call. I was already going into that because I anticipated that would be the issue. Yes, this is on my radar actually. So I'm trying to... It's trying to get that fixed ASAP so that this can be... Because this faces the Brew side.
So I think probably this would be one of the top things to fix. I already have a plan for it. I'll just implement it on the Xano side. And then basically whenever these things enter these different states,
we should just be able to show the date there. If that's the core issue.
Speaker 2 | 15:58
And I guess, come back to the goal for me. I'd actually love the date to be when it was curated, not the date it closed. Because what I'm doing is on Wednesdays, I'm seeing...
Okay, 30 jobs that are said to be published tomorrow, which of those are still open? So I don't really care if it closed in the last seven days. I care if it's up to be published, if that makes sense.
Robert Boulos | 16:30
Interesting. Okay, yeah, for sure. Then.
Speaker 2 | 16:33
So I think it's like I looked yesterday, and I looked at approved, and I'm like, "Okay, there's only one approved job that was approved, and they published five." So that tells me the other four probably closed.
But I don't really have any way of understanding.
Robert Boulos | 16:52
I see. Okay, 100 percent. That's actually a really good one. So I will make it exactly like how you just said and does that apply to any other views from here where.
Speaker 2 | 17:00
But, yeah, I think it's just...
I guess it would be helpful to know for approved and closed so that I could be like, "Okay, so this week they approved these jobs, and then this week they did this many of those closed.
Robert Boulos | 17:39
Yes. What would be useful to you.
Speaker 2 | 17:44
I guess if this was just curated and it had the curation date. So if this field carried over to this.
Robert Boulos | 17:55
Yeah. So? So like ultimately it seems like that it would you just want to curated data is probably more useful than any other than to even know if when it was approved like the curation date is the no wors.
Speaker 2 | 18:12
I'm sorry. No, I'm just thinking it through because you're totally right. You're right. Sorry, it isn't the curation date. I apologize, you're right.
Robert Boulos | 18:28
Go yeah, exactly.
Speaker 2 | 18:28
I think just if this just had approved and had the approval date, that would work. And I guess that's why I was wondering what the last seven days meant.
Robert Boulos | 18:45
So the last seven days is just like literally whatever you see in that column at the.
Speaker 2 | 18:45
So, like.
Robert Boulos | 18:49
So if it says, in this case right now, it says approved, but if it said curated, then it just means the last seven days that were curated in the last seven days, approved in the last seven days. Whatever that column is, just in the last seven days.
Speaker 2 | 19:03
Okay, so that's helpful. So I can go into approved and I can be like, "Okay, in the last seven days, they've approved these jobs." For the closed tab, I'd love for this to say approved and then show the date that it was approved, because if they approve it two days ago, then I'm like, "Okay, that means they're publishing this tomorrow and it's closed, so I should warn them." them.
Robert Boulos | 19:22
The date that it was approved, yes.
Exactly, yes. Because then in this case, well, this is interesting because I'll figure it out from my side, but then there's... From here you have jobs that are closed,
but they could have started off as curated and then they could have just... But they never were approved and they never were published, but they just went straight to close. So I'm just going to figure it out because this column will be empty for those that... If it's just showing dates for approved, it is going to show... I just want to make sure, I suppose, that it's just clear that if there's empty columns, the difference between "it never received a date" versus "it was never..."
I'll figure it out from my side, but I'm just thinking about the different ways that a job could end up on this page and relative to the data that we're associating with it. But no, yeah, that's fine.
But I think the bottom line is that this should say approved in this column. Then that's what we're really looking for because in that way, you know that this was a job that was in the brew side, that was a job that you had curated, that they had published.
Now it's no longer available, and then that's the one that you want to know about that situation. Okay, cool, yeah, of course, no worries, I will adjust that.
Speaker 2 | 20:52
Yeah, that makes sense. Thank you.
Robert Boulos | 20:59
And yeah. Please feel free to keep sharing with me.
Cause this is good.
Speaker 2 | 21:05
And then I think the only other thing I'd notice is that sometimes, jobs that I don't think were published show that they were clicked 25 times.
So I guess I wanted to... Sorry. A lot of tabs. Just like do a double-check why... Click counts are supposed to be showing, or how it's created.
Robert Boulos | 21:34
That is an interesting one. I'm actually looking into this. I was looking at this before the call as well. I'm going to check it out because it's not immediately apparent at first.
I think that's what's happening. Again, it only will take me another twenty minutes to find out. Basically, from what I am gathering,
I think that there just might be some... I feel like at some point we had talked about this, and this is like a while ago now, but where we were thinking about doing the publisher. 25 clicks versus 30 clicks.
I think there was a point where we weren't sure if it would be 25 or 30 or maybe a change from 25 to 30. So I think what's happening might just be that the logic on the back end reflects 30 to publish, and then on the front end, it's looking maybe perhaps just for 25.
I think that there just might be a bit of a change in that sense, but... So I'm going to check it out. I'm going to see. But otherwise, in terms of click count itself being accurate, it should be very accurate
because it's tying into the... The only reason why I feel that way is because I went through it very carefully before, but I will. So that's what makes me think that if there is something here, it's probably more related to a visual problem rather than data integrity issues, which makes it definitely the clicks are coming up.
Then once they hit maybe 25, maybe there's something weird happening that just stops it from going to show it from reaching 30. I think that might be where... It's just like the visual frontend is limiting it from going to 26, to 27, to 28.
But I will look into this. I'm already making some progress with it.
Speaker 2 | 23:34
I'm actually wondering if maybe you have anything to work on I can look at this further while we're on this call. I'm actually wondering if maybe some of these jobs that showed 25 were published.
Robert Boulos | 23:43
Yeah.
Speaker 2 | 23:48
But because we had been working on the Google Sheet and not this, that shows that... Like.
Robert Boulos | 23:56
It's It's possible. There's a lot of things going on all at once, and, yeah, for sure, please, if there's any... I'm always happy for evidence of anything.
If it was, "Hey, look at this job. This job is being weird," we can... I can always use it to trace it backwards. So, yes, please feel free. I am looking into some of the issues right now on my side, and I'm going to try to work on the search and see what's going on.
So.
Speaker 2 | 24:36
Well, I think that's basically all I needed to talk about.
Robert Boulos | 24:38
Yeah, please let me know.
Speaker 2 | 24:49
So you're going to work on making it so that the curated date shows up on the closed tab and then.
Robert Boulos | 24:56
Yeah, the curated data is on the closed tab and probably curated. Well, actually maybe that's the one thing to just clarify is just to be clear on.
Did you? Yeah, no worriess.
Speaker 2 | 25:09
So it's not written down. Then a budget. So let me write those down.
Okay? I think that's what we actually agreed on. You'll add the approval dates at the closed time.
Robert Boulos | 25:26
Yes, exactly. Yes, and we know that it's approved, and then... But for the other ones, for the approved view, did you want to know that it's approved when it was approved on the approved view, or did you want to know when it's curated on the approved view? Or does it matter?
Speaker 2 | 25:52
Just thinking, third party... I think that as long as if I click last seven days and it just shows me the jobs that were approved in the last seven days, then that's fine.
Robert Boulos | 26:04
Okay, yeah, then.
Speaker 2 | 26:06
I'm not sure if that's working because I think that they've approved jobs in the last seven days, and when I click that, nothing shows up.
Robert Boulos | 26:15
I see. So this actually would be useful to know. The most useful thing to know then, from this view, would be what was approved in the last seven days.
I think then that means that this should say "approved" column. The closed tab should have the "approved" column, publisher just have published. I imagine if it's... But that doesn't seem to... But I'll work through it.
I'll prioritize it in that order anyways, so that we'll just... At least we'll get the most important one, I think is closed within the last seven days or closed... But when was it approved within the last seven days? Now I got it.
Speaker 2 | 26:54
Yeah. I think for the rest of them, just having this filter you already have there working is fine. The last seven days filter.
Robert Boulos | 27:02
Cool. Okay, perfect. Then I will prioritize the other ones, and then I'll check into search as well. I will see what's going on with that.
Because then they're searching two ways: search with the job feed and just search in general. I just want to figure out how we can get more visibility in both cases, to be able to search through when the job feed is selected and just search through when there's no job fee selected. And be able to see as much as possible in both filters. Let me just make sure that we covered everything. I think.
Speaker 2 | 27:54
I think the only other thing I think we touched but didn't actually talk about was pulling the direct employer speed.
Robert Boulos | 28:03
Yes, let me. Or it's for the partners. So let me double-check what's happening with the partners. Let's see where you want to go.
Speaker 2 | 28:16
Which might be like the Asana setup, which I'm probably not going to be very helpful with, but.
Robert Boulos | 28:23
No, this is always helpful. We're going to filter by partner and sea.
I just want to find basically where are we getting the information for all the partners.
Actually, what would be, was there a let me just think for a second. We're partners is an interesting one, and I'm just going to check to see where what partners we actually have in the table. We have.
Speaker 2 | 29:18
EL does that mean in Xano.
Robert Boulos | 29:20
Yeah. looking through Xano. I can see that there's a lot of partners, but I just want to double-check and see. Essentially, I just remember when I was doing this that I was coming up with a way to list the partners that was based on whatever was in that list.
I just want to make sure that I'm filtering it down properly. So let me just double-check this.
Speaker 2 | 30:00
And actually, totally separately, I'm making a view for this direct employer's feed, and I am struggling to figure out how I do that and determine what jobs are from what feeds right now. So.
Robert Boulos | 30:13
You can. Is there something you'd like to show me? I'd be happy to help if there's anything.
Speaker 2 | 30:19
Sure it since you're talking.
Robert Boulos | 30:21
Yeah, I'd be happy to... interesting.
Speaker 2 | 30:27
So I don't know who set this up as which it got back to you yet, but basically like in this clicks database we have a valid RTX view that shows valid quote unquote. I'm not sure. Valid means, jobs from our partners over at Raytheon.
And it's like how we've been assessing like how many clicks we're getting for that. And so some are asked me to set that up for direct employers, but I've been kind of tankering around trying to figure out how I would do that.
Robert Boulos | 31:03
Okay, so the view is to find, the column is valid, and it's false, the target URL is... So this is already pretty, looks pretty good, like.
Speaker 2 | 31:17
Yeah, I'm just trying to duplicate it for direct employers now.
Robert Boulos | 31:22
I see. Okay. And for direct employers is a another is that like the literally the name of the feed source or the employer, or is it just like a catch all?
Speaker 2 | 31:38
As a feed source, it's like filtering appcast jobs. So, when I'm going through the filters, I think this target URL including this is what's making it cold Rapiion or RTX jobs.
Robert Boulos | 31:59
What makes you say that? Just so that I can kind of it doesn't look unique to anything there.
Speaker 2 | 32:03
Guess I just went through the rest of these fields and the rest of it didn't look unique to me. Yeah. And like for this target URL, all including that when I started to look through the target URLs, it seemed like that.
Robert Boulos | 32:20
Yeah, that's true, but that's an Appcast, is that AOGSV 3 recruits? That's not Appcast, so that's something specific maybe to Raytheon. I guess that's how they provide their...
Well, no, we build the URLs. All right? So, or you could tell me, is this a URL that comes from Raytheon themselves or is it built on.
Speaker 2 | 32:48
I'm actually a little confused about what this target URL is. So recruits is maybe akin to an Appcast, like it's a Speed we work with, and I think we're... Raytheon is the only jobs they're sending us right now.
Robert Boulos | 33:07
Yeah, I see.
Speaker 2 | 33:07
So Raytheon the employer and we're getting the job from recruitings.
Robert Boulos | 33:13
Yeah.
Speaker 2 | 33:15
But I'm actually not even really sure where this target URL comes into play.
Robert Boulos | 33:20
It's interesting. So if you click on that, it probably takes you straight to the job, I presume.
Speaker 2 | 33:25
It does, but.
Robert Boulos | 33:26
And then if you click on it, okay, I see. So it doesn't redirect you.
So this is probably... Well, I was gonna say it's not tracked, but maybe it is tracked because I'm not sure, but it doesn't look like the URLs that are tracked, so that's interesting. Okay, that's fine.
I'll actually pull it up on my side to see what's happening. So what's the goal when it comes to that table? Is it to just.
Speaker 2 | 33:57
Is what I look.
Robert Boulos | 34:01
To filter down direct, jobs you mentioned.
Speaker 2 | 34:06
Yeah. So my goal is to make a new view that only shows direct employer jobs. So I was kind of backwards engineering, like, "Okay, how is the R TX set up?" So then, how can I duplicate that for direct employers?
Robert Boulos | 34:24
Well, let me ask a question, actually, what does what is can we see like from this data where is a direct employer like which one of is there a row here that represents that test?
Speaker 2 | 34:36
So guess if I go to the default view, it's a good question. Because this shows all jobs, it might take me a little bit of time to find an example.
Robert Boulos | 34:51
That's okay. Because then once you have that example, yeah, something like this.
Speaker 2 | 34:57
So I think it's this. So, yeah, I think you're right. I was in the middle of working on this. I jumped on this call.
Robert Boulos | 35:07
Yeah, okay, so I would personally try to copy that part.
Speaker 2 | 35:07
I think it's this DE.
Robert Boulos | 35:16
So de.jobson.org. Then I would filter basically by, essentially just that.
Speaker 2 | 35:20
8.
Robert Boulos | 35:25
And to see at the minimum, do we have how many others do we have of those? And then I would take. Yeah, exactly. I would do a column drop down and then target uur l equals or includes. Exactly. Perfect.
And it would do filter.
Okay. And then we now we just do a sanity test to see, does this represent, the jobs that you're expecting? And this is a good place to start because maybe this covers all. There has to be some kind of, you know, distinguishing characteristic that you can just, like, latch onto.
And then. And so if it's the URL, if it's, you know, then that's fantastic. I imagine it should be something tied to the URL. Otherwise, there would, you know.
Speaker 2 | 36:28
Yeah, and it seems like I have this look, so I think this is it. I'll double-check with Summer if this looks correct, but I think that's it. Okay, so I think.
Robert Boulos | 36:43
Yeah.
Speaker 2 | 36:44
I think you walked me through it. I think I basically need to duplicate this RTX view so that I have all these other filters.
Robert Boulos | 36:57
Like is what's happening here. Basically, most of this setup is to keep out data that is distracting from here. For example, it's keeping out the crawlers.
It's keeping out the IP address that seems to be related to, maybe it's Summer's IP address or... I'm not sure whose IP address that is, but obviously, it's somebody who visits quite often that it should be filtered out.
So, I think really, when you look at this whole list, everything applies. The only thing is, as you already identified, which is just changing that URL and everything else should be the same. The only other thing was I noticed it to create it at a date. That seems a little bit specific because it's going to show greater than... Okay, I see, so that's fine, too. I'm assuming that's just a date in the past.
So, if it were me, from this list, I think the solution is exactly what you did. Just pop into your RL, everything else just stays the same, and then you have your view.
I think that gets you to the solution.
Speaker 2 | 38:17
Awesome. Thank you. Now I feel more confident making that life.
Robert Boulos | 38:23
Yeah, no worries. I like working at the stuff.
Speaker 2 | 38:29
I don't know what you look at when you're trying to search for feeds. If any of that knowledge about the direct employer URL or anything is helpful.
Robert Boulos | 38:41
Yeah, I mean, there's so many... It's all I have pretty much. Now I'm starting to pick up my clues from the URLs as well, because I found that that's a lot of the time.
If I can recognize what that looks like, then that's pretty much the best answer most of the time, actually. It leads me to what I was thinking about, which is that, because you mentioned that, what happens when a job is closed on the app.colab.work.com view?
But that's closed. I'm pretty sure that it's just still the symptom of, well, the job is closed. If the job is
closed from the Brew app, then that just means because the source itself is deleted. So if the source is deleted but it's still visible on the app.collabor.com view, then that would mean, I think, that it all comes back to the same question of different data sources because that app itself is just pulling from it. As we've gone through before, from a different data source entirely.
Speaker 2 | 39:48
Right.
It's pulling from a different data source entirely.
Robert Boulos | 40:12
Yeah. So it's pulling from Upstash, as we presume, or from Intelo SS from one of these services that have been set up to work in parallel, but they're not synced with... I mean, we don't really have...
I think Andrew's been looking into it, but I don't know what's going on with it, because it's an issue, but that's the answer to it. Simply, it's been this ongoing mystery, I suppose, which is too long of a mystery.
At the same time, if it depends on how much it's hurting, is it a problem that you're running into quite a lot? It's interesting how that page is still relevant, it seems.
But not so relevant in other cases.
Speaker 2 | 41:14
So we're not sure. Or you're at least not sure. Maybe Andrew figured out right now where the app is pulling from. It might be tight sense, but.
Robert Boulos | 41:26
Yeah, I think we know where it's coming from, but the problem is that wherever it's coming from, the data is not... Let's just say it's not sanitized, maintained, or synced with what the Xano application is using to determine if a job is available or not.
So when we look in Xano, if a job is closed, it just means that from the main table that has disappeared. However, we don't know if that same job has disappeared from wherever the app.collabor.com view is looking. It could...
It's well, we know that it's looking at somewhere totally different. And that's, I think, what it all boils down to, just that discrepancy. It's like when it disappears from this table, the job feed.
Because the job feed told us it's not there anymore, so we're just reflecting that it's gone now. But on the app.collabor.com view, nothing happens. It doesn't seem like the same thing has affected it on that side.
Then it just raises the question of, well, okay, so what rules is this applying to? It's an app.collabor.com site, a doc.collabor.com site. So yeah, it's a mystery.
Speaker 2 | 42:46
So I think if it makes sense to you after a call in the tech channel, I'll kind of Andrew in on this to just see if he has any additional intel.
Robert Boulos | 42:56
Sure.
Speaker 2 | 42:58
Basically, I've noticed that sometimes jobs close on this app. Robert bet,
but then they are still on our app. So the Versal is pulling from Antro, and I'll ask him to clarify where the app is pulling from.
Robert Boulos | 43:11
Yes, it's... Yeah, that's exactly the question, really. Like, where exactly is it pulling from? I'm pretty sure he'll know. He'll say, "It's just a..." Then again, the then, it comes back to, "Well, why are we using that?"
It's just because I think it all comes back then to the search there seems to still be more convenient to use. I presume that's maybe why it gives visibility.
Speaker 2 | 43:49
I just had issues with the search, which as I paused and laughed, on the other outside.
Robert Boulos | 44:00
So not so much. [Laughter].
Speaker 2 | 44:08
I think it's just messy and we have some partners just already using And.
Robert Boulos | 44:14
Well, I was gonna ask what the... What is the... Why still use it if it's so problematic? Because it would seem that the last thing that's really still holding onto...
I'm wondering what the benefit is because it isn't.
Speaker 2 | 44:36
Six.
Robert Boulos | 44:41
Again, maybe I don't know. Maybe there's some clicks being tracked through there or it's driving traffic or something I'm not aware of.
Speaker 2 | 44:50
I don't think I really understand the infrastructure enough to fully answer that.
Robert Boulos | 44:54
No worries. I don't think any of us do.
Speaker 2 | 44:57
I just never.
Robert Boulos | 44:57
I think. I think that might be the reason why none of us could just, like, let's just not touch it and just leave it. Leave it be. But, yeah, I would say then maybe the best way I can help with that is actually just to solve some of the stuff we discussed with the searching.
If the searching can work really well, if we can just get all the nurse jobs, if there can just be no reason that you'd ever have to go back to app.clau.com, then maybe that is one way to solve it. And then one way you can just look at it like you are to confidently say, you know, you are totally useless. I don't need you anymore.
And then you can let it go. But it seems like it still has, like this edge cases where it's still useful. Maybe.
Speaker 2 | 45:47
I guess there's just a lot of things that our old app did that this new app doesn't do. I guess no app is really doing it now, so we're in this middle place where we're like, "Well, before partners could log into that app and search for jobs, but see their earnings, see that the Bread doesn't earn money through us.
Robert Boulos | 46:01
Well, that's a really interesting question. What did the old app do?
Speaker 2 | 46:22
They're in a unique scenario where we don't pay them, but most of our partners do, so they could log in and be like, "Okay, I'm giving this many clicks, I'm getting paid this much. I'm now failing to remember how the job boards worked on the old app, but actually, I guess that's something that the current app does that we do utilize quite a lot, which is curated job work.
Robert Boulos | 46:53
Yeah, so the job board itself, the fact that it is a curated jobb.
Speaker 2 | 46:59
Which in this new app, they are not auto-curated, which is a pain point, but you can at least manually curate and people can share this.
Robert Boulos | 47:12
Okay, I see. But then this isn't providing a search. I guess this is like a sub-functionality of the... If let's say... I believe his name is Justin.
If you were to log in and use this application, I presume that he goes over to the main view of it and then starts to search through the search box and then tries to find through
exactly. Like opportunities through here. And I presume that he's doing this because it works better for him than using the.
Speaker 2 | 47:48
Yeah.
Robert Boulos | 47:51
The table.
Speaker 2 | 47:56
I now, he will primarily use ourselves to fill the Brew. "Hey, here are the jobs you can publish when they're publishing specific jobs." Then he'll bounce over to this app and add jobs to the dashboard so that the morning brew can run this page.
Robert Boulos | 48:18
Okay, let me see. Then I think the better way is probably the easiest way is just to make the Versal make the search better, give less reasons to have to use this, perhaps.
Then that just stays in that and keeps this going, and then allows us to just figure out basically the question. The question is still, why is it closed on the other side but not here? I'm not sure even if we were to answer that question, it might just come back to another question before that, which is why are we even using this?
Why do we even have two systems? So, to even answer that question, I think the best thing I can do is just make it so that if the Versal app is working really well, then that means there's less reason to have to use that, and then they don't have to maintain two systems eventually. I'm not sure when that will come. I'm just trying to see if I can make that date come as soon as possible.
I think if I can make the search better, it might come sooner.
Speaker 2 | 49:41
Yeah, I guess I'd say, like, for now, like, if you are able to tackle the stuff we've kind of talked about, that's like, most helpful in the immediate future.
Robert Boulos | 49:50
Yeah. Exactly.
Speaker 2 | 49:55
And yeah, maybe me asking Andrew. But I mean, summer doesn't want to use the app forever. I think we're just continually putting out fires and a full app rebuild is.
Robert Boulos | 50:02
Exactly. Yeah.
Speaker 2 | 50:09
And then, like, it's tackling the mini fires that I'll roll up to this app.
Robert Boulos | 50:11
No, you know, honestly, I agree, though, that this is... I think this is for me, I like to make things last longer, I suppose, and I think that, yeah, I hate the idea of rebuilds.
I think that it's better anyways to move gradually through it. But I think that we don't need to rebuild. Just make it last longer and redesign it, you know, it'll turn into whatever you need it to be over time. In all in complete transparency,
I think that that's what happened with the previous developer is like you had the version one, and then the idea was to just do a version two, and a lot of developers will do that.
It's like, "Let's just rebuild the whole thing." The thing is that when anything is rebuilt, it's going to introduce the bugs that were solved in the first build. The bugs that were squashed the first time. You will see them all come back, and you have to squash them again because that's just the nature of it.
All those cases will come back, but however, I think we're beyond that now. Just to say as a post mortem of a mini post mortem of what happened with the previous developer, what's the problem with rebuilds?
I've made that mistake in the past more than anybody. So, I guess mostly this is the voice of pain speaking. Now, I'm going to just quickly do a quick search over here to see if nurse is popping up. Better, why is nurse?
Okay, I'm going to check it off. I'm going to check it on my side with the searching with everything, and I have my list, so. But, yeah, I have my marching orders. So if there's anything else, though, from your side you'd like me to look into, I would be happy to.
But, yeah, I think I have a good idea of what to focus on.
Speaker 2 | 52:30
No, I think. Yeah, I think we're good. I'm gonna throw the action items into our link group chat just so we're on the same page.
Robert Boulos | 52:36
Yeah. For sure, please?
Speaker 2 | 52:40
And I just feel great. Let me up. You're like, "Hey, wait, I don't know what this means." I don't think that's right.
Robert Boulos | 52:46
Yeah, for sure. Sounds good. No worries. It's more than happy to do it that way, and if there's anything, just please let me know. I will be here and I will let you know about how it goes. I'm sure I'll be able to make progress with most of these things.
Speaker 2 | 53:04
Awesome. Robert, too.
Robert Boulos | 53:05
CO course. Thank you, Ashley. Have a good one. Have a nice weekend. See you. Bye.
