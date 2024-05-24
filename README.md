# Exploring Effect

This is a test bed for how to integrate Effect into existing react apps,
and potentially start a new one with Effect in mind from the beginning.

Built with vite.

## Thoughts

Check out the [#react](https://discord.com/channels/795981131316985866/1151827019684905000) channel on Effect discord for the latest developments.

- At first, explore an easy to drop in hook based API (as easy as react-query): Push this as far as it will go, understand the limitations
- See if we can provide Effectual Context via React's Context (with [this](https://github.com/mikearnaldi/effect-remix-stream/blob/main/app/lib/utilities.ts)?)
- Explore [effect-rx / rx-react](https://github.com/tim-smart/effect-rx/blob/main/packages/rx-react/src/index.ts) as per latest discord members' comments, watch tim's work.
- Can we compose better as a hook? Or is there a way to think of React as a side effect within an Effect? Or take inspiration from Effect
  cli and think of Effect/ui and have react bindings? #thoughts

**Expanded thoughts: WIP**

I think Effect is _very good_ for the TS ecosystem. I want to adopt it. I mostly find myself in
TypeScript & React codebases, and will be in .NET server land in Azure #soon. So, can I adopt this
in any Node/Deno/Bun middleware, and of course, the all important React codebases?

- Can JSX be directly adopted?
- Can we compose React+Effect via hooks, what are the compromises?
- Can we compose React _into_ Effect into some UI Effect?
  - Could we compose together UI Effects like we do components?
- Can we make it _as easy to adopt_ as something like react-query? Could it be as popular, or a default choice?

We'll see!
