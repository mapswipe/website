---
title: Using MapSwipe to validate OSM building quality data in Nigeria
publishedDate: 2023-10-19
author: Paul Knight
description: Using the MapSwipe data, the Nigerian Red Cross are now able to see the accuracy of the previous mapping and any edits that need to be made to the community map as it is today.
coverImage: /img/blogImages/2023-10-19-cover.jpg
featured: false
---

_**Read the [original post](https://medium.com/digital-and-innovation-at-british-red-cross/using-mapswipe-to-validate-building-quality-data-in-nigeria-6caf68a5da16) on the Digital and innovation at British Red Cross blog on Medium.**_

At the beginning of 2021, the British Red Cross began supporting the Nigerian Red Cross to implement a Disaster Management Programme across several states in Nigeria, preparing communities for disasters.

This year, in 2023, the programme is expanding to cover additional communities in 2 more states, as well as increasing the number of communities in the states that the programme has been working in so far.

We have previously written ([1](https://medium.com/digital-and-innovation-at-british-red-cross/3-steps-to-data-readiness-with-the-nigerian-red-cross-182a153c5d3e), [2](https://medium.com/digital-and-innovation-at-british-red-cross/first-time-this-community-has-been-on-a-map-nigeria-f592906b7be1), [3](https://medium.com/digital-and-innovation-at-british-red-cross/asking-so-what-transforming-data-into-action-with-the-nigerian-red-cross-96ff6c22085a)) about how the GIS and Information Management Team at the British Red Cross, have helped to strengthen the Nigerian Red Cross’ Information Management capacity, including GIS and Mobile Data Collection, as part of this programme.

With new states and communities selected this year, the Nigerian Red Cross is leading on similar activities conducted previously. One of which is through Digital Community Mapping for the Enhanced Vulnerability Capacity Assessment (EVCA). More information about what this is can be found in a [past blog](https://medium.com/digital-and-innovation-at-british-red-cross/first-time-this-community-has-been-on-a-map-nigeria-f592906b7be1).

![A woman standing outside and wearing a red British Red Cross ball cap and branded t-shirt looks at her phone.](/img/blogImages/2023-10-19-volunteer.jpg)
_Digital Community Mapping — Carter Olayemi/Nigerian Red Cross_

Previously, the Nigerian Red Cross followed the Missing Maps methodology as presented on the [Missing Maps website](https://www.missingmaps.org/). First, digital volunteers, trace aerial imagery to create a basic digital map on OpenStreetMap. Next, using various data collection tools, community members with local knowledge add detail to the map, such as medical facilities or schools, and rank their capacity or vulnerability, with any public data added to OpenStreetMap. Lastly, the map data is used in products for local disaster risk management planning, for advocacy with stakeholders, and as reference maps during emergency responses.

## Improving the quality of map data

However, what if building outlines and roads had been added to OpenStreetMap previously? We strive to be positive stewards of the map, and it is best practice that if we are working in a community to make it the best representation of that community, with community members, to support current and future needs. Communities could have experienced significant real-world changes over time since it was first mapped, or new buildings could have been imported from AI models developed by companies such as [Microsoft](https://github.com/microsoft/GlobalMLBuildingFootprints). We therefore want to check that everything is correct!

In one of the new states that the programme is expanding to, we saw that there were some building outlines that were a direct import from an AI dataset. When a user adds data from this source it is best practice to review each building being added from the AI dataset to ensure it matches the building outline.

But how? We used MapSwipe — a mobile app, which allows users to **Find** and flag features such as building or roads in imagery, which then speeds up the mapping process as remote mappers map areas which are known to have a features in them. In the past year the project types have diversified and now include **Compare** imagery and **Validate** quality of mapping. For the Nigeria Programme where there was existing map data, we opted to use the Validate project type.

![Graphic showing different MapSwipe project types: find, compare, and validate.](/img/blogImages/2023-10-19-project-types.jpg)
_Different MapSwipe projects — MapSwipe_

For communities without any previous mapping Nigerian Red Cross conducted a mapathon, as in the previous phase of the programme.

In September 2023, the Nigerian Red Cross held a mapathon and mapswipe-athon, involving Nigerian Red Cross volunteers from various branches around the country.

- **5,733** buildings were validated using the Validate project type on Mapswipe.
- **1,766** Buildings were mapped at the mapathon using the [HOT Tasking Manager](https://tasks.hotosm.org/).

![The screens of a tutorial for the MapSwipe validate project type.](/img/blogImages/2023-10-19-tutorial.jpg)
_Tutorial for a MapSwipe Validate project type — MapSwipe_

Using the MapSwipe data, the Nigerian Red Cross are now able to see the accuracy of the previous mapping and any edits that need to be made to the community map as it is today.

Any building edits are then put on a [MapRoulette](https://maproulette.org/) challenge — where users can sequentially go through each building correcting them.

Once completed and validated, we have an up-to-date map of the community showing building and road outlines, ready for local community information to be added. After, this is then ready to be used for local disaster risk management planning, for advocacy with stakeholders, and as reference maps during emergency responses.

## Summary

Whenever we map an area, such as for Digital Community Mapping in an EVCA, we want to be effective and respectful stewards of the map. This involves checking previous edits for their sources and when the map was last updated.

In the Nigerian Red Cross Disaster Management Programme, several communities had existing map data. To check the data quality, we used MapSwipe and the Validate project type. Volunteers using the app were able to show what buildings were in the correct place, offset, or where they were not in the correct place at all. By assessing data quality, we can create an improved community map, for use and ownership by and for the community, supporting the programme’s aim to prepare for disasters.