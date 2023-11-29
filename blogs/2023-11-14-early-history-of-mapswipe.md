---
title: "The early history of MapSwipe"
publishedDate: 2023-11-14
author: Ivan Gayton, Pete Masters, and Dan Joseph
description: "The real story of MapSwipe is the volunteers who give their time to improve humanitarian mapping, the agencies that use the data to save and improve lives, and the incredible developers who continue to build and maintain MapSwipe and make it a key tool in the open mapping ecosystem. However, we hope people sometimes remember how we originally built MapSwipe."
coverImage: /img/blogImages/2023-11-14-cover.jpg
featured: false
---

## The World is Big. Where are the Features that Need Mapping?

From aerial or satellite imagery, it can be challenging to find features that need mapping. In many places, human settlements are small, sparse, and difficult to see unless you zoom in closely. We built MapSwipe so that large numbers of volunteers using mobile phones could help quickly find features to map for humanitarian purposes.

## Nutritional Assessment Needs in South Sudan

The specific impetus for MapSwipe came in early 2016, when Médecins Sans Frontières (MSF) field teams reported a nutritional crisis in South Sudan. Epidemiologists wanted to conduct a field assessment to understand the scope of the child malnutrition they were seeing in their clinics.

If the assessors could only see the people in the "easy-to-see" places such as larger towns and settlements close to roads, the results will not reflect the real situation. We needed to know where people were in order to assess their nutrition and health.

We needed a map of settlements and shelters. 

## A Map to Guide Them

The MSF-UK team, already a co-founding member of the [Missing Maps consortium](https://www.missingmaps.org/) with the British Red Cross, American Red Cross, and the Humanitarian OpenStreetMap Team (HOT), planned a mapping campaign to determine where all settled areas were to plan the field assessment and not miss remote communities.

We set up a campaign on the [HOT Tasking Manager](https://tasks.hotosm.org/). Volunteers would log into the platform, choose a square of several square kilometres of South Sudanese countryside, and trace every human settlement or structure they could see.

It did not go well.

## It's hard to map sparse features amongst large areas of bush

Much of South Sudan features a scattering of round, brown huts, in a landscape full of round, brown trees and round, brown rocks. That was exhausting to map.

We found it impossible to avoid missing shelters—or even entire settlements. Finding all of the features in a square of imagery takes a lot of mental discipline ([it's hard to resist zooming in and out](https://xkcd.com/1169/)), and it's inefficient! Map editing programs like [JOSM](https://josm.openstreetmap.de/) and [QGIS](https://qgis.org/) are not well-adapted for searching through large landscapes.

We (Ivan Gayton, the Innovation Officer, and Pete Masters, the Missing Maps coordinator at MSF-UK), asked ourselves, "How can we enable our volunteer mappers to get only one good look at every bit of a large area, at a close enough zoom level to not miss anything?" We began to wonder, could a tool other than the mapping programs be used to identify areas containing features?

We looked at a few existing applications, including [a scientific project called Zooniverse](https://www.zooniverse.org/), which allows people to search the skies for astronomical objects. Benni Herfort from the University of Heidelberg did some prototyping using [an open source image classification crowdsourcing tool, PyBossa](https://pybossa.com/), with promising results. 

Then, our colleague Andrew Braye from the British Red Cross asked, "wouldn't this be faster, and wouldn't more people be able to contribute, on a mobile device?" People could swipe through images of landscape on their phones, select squares with features to map, and reject those without. _Could we make something like the popular swipe-based dating app for humanitarian mapping?_

## A Sapling Innovation Fund and an Example Proposal

As we grappled with the mapping campaign for South Sudan, Dr. Phil du Cros and Dr. Kiran Jobanputra, the leaders of MSF-UK's medical scientific unit, were determined to find better ways to innovate in humanitarian medicine and public health. They created a Sapling Innovation Fund, a mechanism to invest in small, speculative projects and asked Ivan to write a few example two-page proposals to illustrate the way people should apply to the fund. Ivan wrote several of these and emailed them to Phil, expecting that they'd be used as examples for others to follow when pitching their own ideas.

A few weeks later, Pete called Ivan asking if he knew anything about £50,000 that had apparently been allocated to some kind of mobile mapping application. "Ooh, I guess they thought our _Swiping for Humanitarian Mapping_ idea wasn't just an example proposal," Ivan said. "Let's build it!"

## Building MapSwipe

Armed with the unexpected £50,000 budget, Ivan reached out to [Pim de Witte](https://www.linkedin.com/in/pimdw/), a young tech entrepreneur who had recently retired his successful gaming company and was interested in humanitarian work (they had previously worked together on an application supporting Ebola medical records, and have been close friends ever since). Pim agreed to join the project as lead developer at a ludicrous discount for a software developer of his experience. Ivan and Pim set out to build a new tool. 

### Feel and Frameworks

We knew that for MapSwipe to be successful, it needed to feel good, like a high-quality game. Not simply "gamification," adding scores, social features, and so forth to non-game applications (a hot trend around 2016), but the sensation of using the app itself. As a game creator, Pim was familiar with the subtleties of "feel." For example, exactly how far should a swipe gesture go before it continues to the next image, as opposed to snapping back? How should the speed of the swipe affect that critical distance (should a fast short swipe have the same result as a slow long one)? How quickly does a new image load? We chose to work with React Native for a smooth, fun-feeling app, which turned out to be a lucky choice and contributed to the success of MapSwipe.

### The Team

Pim and Ivan reached out in the tech-for-good community looking for volunteers, and got dozens of responses. Wanting a tight team, we chose two key volunteers, [Alison Malouf](https://www.linkedin.com/in/alison-malouf/), a design student at Harvard, and [Sadok Cervantes](https://www.linkedin.com/in/sadokx/), a designer and front-end developer based in Mexico City. 

Sadok, Alison, Ivan, and Pim spent three intense months building the MapSwipe prototype.

### The Sprint

The MapSwipe prototype came in on time and on budget, an unusual result for any software development project! Of course, this was partially due to a hyper-qualified development and design team (Pim, Sadok, and Alison) working at a small fraction of their market worth while Ivan tried to keep it aligned with the practical needs of users. Pete and Benni provided rapid feedback and reality checks.

The small team deliberately kept a narrow focus. Pim shared his advice with the team, "Build a razor blade, not a Swiss Army knife." We focused on doing just one thing, and doing it well. 

_Choose a mapping project. Read the instructions. Swipe. If you see a feature, click the square it's in. Swipe again until you see another feature. Click._ 

A simple, repetitive workflow, but efficient, and much more satisfying and fun than scrolling around with a mouse on a laptop. 

When the first version of MapSwipe was released, it was an immediate success, both in terms of users enjoying contributing, and in terms of data users getting useful datasets. The app got some media attention and won a few awards, but the real payoff was seeing people actually using MapSwipe.

### Handover

The initial development team wasn't sure how to continue managing MapSwipe. The Red Cross was kind enough to support the hosting financially, but Pim and Ivan didn't feel confident in their ability to keep up the maintenance and improvement. Fortunately, Benni Herfort at HeiGIT, part of the University of Heidelberg, stepped up! Along with a group of open-source volunteers and professionals, Benni and his collaborators took over the project and in 2019 launched version 2.0. This brought the app on from its 'prototype' state and laid the foundations for future improvements, with all the front-end development done by a single volunteer Laurent Savaete. As of 2023, seven years after the first prototype, new features continue to be added, new ideas implemented, and new users join [all sorts of worthy projects](https://mapswipe.org/en/data/). 

A well-maintained Free and Open Source Software project, lasting over many years with lots of users and community developers is something of a Holy Grail of the humanitarian tech sector, and MapSwipe has a good claim to be among the successful ones. 

The real story of MapSwipe is the volunteers who give their time to improve humanitarian mapping, the agencies that use the data to save and improve lives, and the incredible developers who continue to build and maintain MapSwipe and make it a key tool in the open mapping ecosystem. However, we hope people sometimes remember how we originally built MapSwipe. We hope this story can inspire people: given a simple but difficult and important problem, a small, dedicated team with a small budget—benefitting from trust, support, and autonomy—can produce working, lasting solutions to do more good in the world.
