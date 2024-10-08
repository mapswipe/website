---
title: "Enhancing Accessibility in MapSwipe"
publishedDate: 2024-08-05
author: Jenny Chan
description: "The American Red Cross is excited to announce the launch of new functionality in the MapSwipe app. We supported an enhancement to make MapSwipe more accessible and easy to use for a wider community of users."
coverImage: /img/blogImages/2024-08-05-cover.jpeg
featured: false
---

The American Red Cross is excited to announce the launch of new functionality in the MapSwipe app. We supported an enhancement to make MapSwipe more accessible and easy to use for a wider community of users. 

## The Challenge

The MapSwipe 'Find' project type has users swipe through satellite images to search for any that contain requested features (e.g., buildings, roadways, or waterways) then tapping to indicate whether the features are present. Users tap a different number of times to mark areas as containing the requested features or needing further review.

In the current version of the MapSwipe app, the only indication of the number of taps is through transparent color overlays. However, feedback provided by users noted that this format posed challenges for users with color blindness or when color filters, such as night mode, are turned on, making it difficult to swipe and contribute to projects effectively.

![A screen grab from the MapSwipe app showing the 'Find' type project with only a color overlay on tiles. It is hard to distinguish between the different overlays on different tiles.](/img/blogImages/2024-08-05-color-overlays.jpg)
_The 'Find' type project with only a color overlay on tiles. Top right: green, middle right: yellow, middle left: red._

One user shared: "I'm slightly colorblind like many other males and the very minor difference in colors can be confusing. It's nice that I can count my taps (1 = building, 2 = maybe, 3 = cloud) but the app would be much easier to use with some sort of other indicator."

Another user wrote: "As a colorblind user the shades that occur after the taps are basically indistinguishable for me. Would you please consider adding textures (like cross hatches), icons, and/or alternate color schemes? As the app currently is, I'm unable to use it. About 8% of males and 0.4% of females are colorblind, so improving accessibility would allow more people to use it."

## Our Efforts

Our recent MapSwipe [update v2.2.10](https://github.com/mapswipe/mapswipe/releases/tag/2.2.10(0)) provides a more inclusive approach with the introduction of icons that can be toggled on or off. In addition to the color overlay, each area will show: 

- A check mark icon for areas that contain the requested features.
- A question mark icon for areas that need further review.
- A bad imagery icon for areas that cannot be assessed due to poor image quality. 

![A screen grab from the MapSwipe app showing the updated 'Find' type project with both a color overlay and descriptive icons.](/img/blogImages/2024-08-05-with-icons.png)
_The updated 'Find' type project with both color overlay and descriptive icons. Top right: check mark, top left: question mark, and the rest of the tiles: bad imagery._

These icons are designed to be easily distinguishable and intuitive. The update adds the option in the settings of a user's profile to toggle the icons on or off, ensuring that all volunteers can contribute to our global mapping efforts using the mode that works best for them.

## How This Benefits Our Community

This update is more than just a technical improvement; it is a response to feedback from our community and dedicated volunteers as well as a testament to the collaborative spirit that drives MapSwipe. By making these changes, we aim to:

- Increase participation from volunteers who previously had difficulties contributing.
- Improve the accuracy and reliability of our crowdsourced data.
- Create a more inclusive community where volunteers feel valued and capable of making a meaningful impact.

We suspect that his update will better the MapSwipe experience for all users, not just those with accessibility needs who were willing to speak out about their challenges. We are grateful for a community that is open to discussing how we can improve.

## Supporting Our Volunteers

The American Red Cross has long recognized the value of open source tools and the power of community-driven projects. By investing in MapSwipe and supporting crucial updates like this one, we are enhancing the volunteer experience and ensuring that our platform is inclusive and welcoming to everyone. Accessibility is a core value for us, and addressing this long-standing issue not only improves our tool but also strengthens our volunteer community. The need for reliable geospatial data is immense, and with your help, we can continue to make a difference.

## Get Involved

Join us in this journey. The MapSwipe website [has a page](https://mapswipe.org/en/get-involved/) on all the ways you can get involved! Join our community of volunteers dedicated to making a global impact. Follow us [on Mastodon](https://floss.social/@mapswipe) for the latest updates. Let’s keep MapSwiping!
