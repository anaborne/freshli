# What Freshli is

Freshli keeps track of the food in your fridge. You photograph your groceries,
the app reads it and proposes a list of what it can see, and you fill in the
amount, the unit and the expiration date before anything is saved. The
dashboard puts whatever is closest to going off at the top. When you want to
cook, you pick some of what you have, ask for recipes built around it, and
after you cook one the app subtracts what it used from your stock. The hard
part of an app like this is the part nobody expects: dates and units. A date
typed as 2026-09-04 can display as the day before for anyone living west of
London, so food that is still good reads as expired. A recipe line calling for
two tablespoons should never take two pounds off a bag of butter, and two
cartons of milk bought a fortnight apart should stay two separate entries. The
project has 40 automated checks pinning those cases, and the date ones run
under four time zones.
