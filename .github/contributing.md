# Contributing to Metadata-Management

## Welcome

Hi there, if you just landed here and want to help this app to move on, **welcome**!

### Reporting bugs

We use [GitHub's issue tracker](https://github.com/SferaDev/Metadata-Management/issues) to manage the current issues or features planned.
You might find helpful the issue templates provided on that page so you can summarize we could improve.
Bear in mind that we also keep track of the issues in a [GitHub Project board](https://github.com/SferaDev/Metadata-Management/projects).

### Code style

To keep all the source code clean and readable we use a plugin called "prettier" that takes most code style decisions before commiting.
You can write new code as you want but make sure to run ```yarn prettify``` before merging a Pull Request.

### Merges and commit messages

Well we don't actually allow merges on this repository, we prefer a "Squash and merge" strategy on Pull Requests.
That way before including a change on ```development``` we prepare a meaningful commit message.
In the commit title we often keep the reference to the Pull Request number so we can also track the discussion and inner commits related to a change.
Note that "Rebase and merge" is also allowed but only for certain cases where you actually want to split the Pull Request in smaller changes, before merging just make sure the commit history is clean.

### Force pushing

Force pushing is disabled in ```master``` and ```development```.

In fact ```development``` should **never** be pushed directly.
And ```master``` should **always** be pushed directly.
What?

Yes: 1) we enforce pushes to ```development``` through Pull Requests and 2) we keep master as a snapshot branch for public releases.

### Travis, Codacy and Greenkeeper

To make sure the project is always in a buildable and up to date state we use CI tools.

- Travis builds every change we send to GitHub and **blocks** merging broken changes to ```development```.
- Codacy reviews the technical debt found on the code and advices of "bad-smell" Pull Requests.
- Greenkeeper makes sure our dependencies are always up to date and we are bullet proof of security holes.

### Releases

When new features are ready for production we tag releases from ```master``` and include the release zip for a given commit.

When new changes are included in ```development```, Travis automatically tags pre-releases with a release zip to beta test new features.
