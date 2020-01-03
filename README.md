# react_component_ar_vr

An example of React Component rendered using Aardvark with synchronized data driven by events using croquet as a backend.

Work in progress, still experimenting with react / aardvark.

## Quick Overview / call outs of existing quirks.

- conditionalGrabbable is a component attempting to abstract away the swapping of grabbable with a basic transform
- ticTacToe component has the base logic that opens a connection to croquet on the given channel
- the scene is crude but base functionality is
  - yellow box: reset
  - red x = flag for destruction next move
  - circle / square spawn a peice. Once a piece is moved by someone no one else can move it.
- Theres a race condition that could be gaurded against where two people who pick up an object on the same frame will both own it.
- if your using this to test, change the session id to avoid everyone jumping into a shared session
- the board is positioned globally, this only makes sense if your vr space shares the same real world space, for other scenarios it's probably better to not share the board position.
- things should probably be rate limited to the server and lerped in the client.
- ownership and lease time is a workaround to help the conditional grabbable do the right thing to interact with aardvark
- the webpack config used in this project is different from the generated one through avcmd
- letting the client decide the spawn point of game objects is scary
- the viewID would be better injected as a separate parameter (not in the event data)

## Known issues:

- The repeated elements cause aardvark to crash when multiple people are interacting with them, investigating.
