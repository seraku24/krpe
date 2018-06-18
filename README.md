# Keylogger-Resistant Password Entry
This is a client-only mock-up for a hypothetical password entry system that should resist eavesdropping.

![Demonstration](demonstration.gif?raw=true)

## Disclaimer
This project is entirely a joke and is __*not*__ intended for usage in any production environment.

## Background/Motivation
After seeing some posts on [/r/ProgrammerHumor][1] depicting (bad) UIs for entering passwords, I decided to throw together an adaptation of an old card trick as a means for inputting characters.
The "trick" involves presenting a seemingly random ordering of letters in several groups.
The participant need only identify the group in which their letter appears.
After doing this a few times, it can be determined precisely which letter the participant intended to enter.

[1]:https://reddit.com/r/ProgrammerHumor

## Changes
Aside from some general cleanup of the code and styling, I have made a few improvements beyond my original Reddit post based on feedback within the comments:

- Added unique highlighting for character type (digits, uppercase, lowercase, and punctuation).  
*This should reduce the time it takes to locate a particular character.*
- Calculated the number of steps needed based on the configuration.  
*This resolves a bug that was present in my original post, where I had required four steps when three would have been sufficient.*
- Generalized some aspects to permit supporting a different character set and/or number of buttons.  
*This work is not complete, as currently there is still manual line breaking that assumes the default parameters.*

## Analysis
Does this approach actually work for resisting eavesdropping?
Yes and no.

For casual eavesdropping where an adversary is unable to record the process for later review, it should be theoretically impossible to obtain the password entered in one session.

That said, an adversary would still be able to learn some things about the password, such as its length.
Also, anytime a user presses a button, they are revealing which options are *not* the next letter.
If an adversary were to observe an individual on multiple occasions, they could slowly begin to reduce the possibilities for each letter in the password to the point that they could eventually deduce the whole thing.

For sophisticated eavesdropping where an adversary can record the process, it is possibly trivial to break even after one session.
Upon review, one could see which letters were displayed for each button pressed.
If only one is in common, then it must be the letter.
Otherwise, there can only be so many possible candidates.
The potential resulting passwords might be few enough that brute-force is valid.

Internally, I am representing information differently than what is displayed.
That is, the *order* of the letters shown are in ASCII order to make it easier for users to locate the letter they wish to input.
Behind the scenes, however, the letters are kept in an order that is necessary for the algorithm to function.
In fact, if I had not sorted the letters for display, then it would be trivial to determine the letter as it would always be the middle one on the final button pressed.
I am also employing more randomization than the original card trick requires, so it is possible this added non-determinism might increase the chances a sequence of buttons would have more than one option in common.
But it is unlikely that this would add enough variability, and recording an individual entering the password on multiple occasions would almost certainly produce only a single possibility.
