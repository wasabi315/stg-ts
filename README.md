# stg-ts
A toy stg interpreter in typescript

## Example
```sh
$ yarn start
```

```
Program
╭─────────────────────────────────────────────────────────────────╮
│  main = {} \u {} ->                                             │
│      letrec                                                     │
│          20 = {} \u {} ->                                       │
│              Int# {20#}                                         │
│                                                                 │
│          res = {20} \u {} ->                                    │
│              fact {20}                                          │
│      in                                                         │
│          traceInt {res}                                         │
│                                                                 │
│  fact = {} \n {n} ->                                            │
│      letrec                                                     │
│          fact# = {fact#} \n {n#} ->                             │
│              case n# {} of                                      │
│                  0# ->                                          │
│                      1#                                         │
│                                                                 │
│                  default ->                                     │
│                      case -# {n#,1#} of                         │
│                          m# ->                                  │
│                              case fact# {m#} of                 │
│                                  fm# ->                         │
│                                      *# {n#,fm#}                │
│      in                                                         │
│          case n {} of                                           │
│              Int# {n#} ->                                       │
│                  case fact# {n#} of                             │
│                      fn# ->                                     │
│                          Int# {fn#}                             │
│                                                                 │
│  traceInt = {} \n {n} ->                                        │
│      case n {} of                                               │
│          Int# {n#} ->                                           │
│              traceLit# {n#}                                     │
╰─────────────────────────────────────────────────────────────────╯

Result
╭─────────────────────────────────────────────────────────────────╮
│  2432902008176640000                                            │
╰─────────────────────────────────────────────────────────────────╯
```

## References
- [Simon L Peyton Jones [July 1992] "Implementing lazy functional languages on stock hardware:
the Spineless Tagless G-machine
Version 2.5"](https://www.microsoft.com/en-us/research/wp-content/uploads/1992/04/spineless-tagless-gmachine.pdf)
- [mizunashi-mana [April 2019] "STG Version 2.5 の動作"](https://mizunashi-mana.github.io/blog/posts/2019/04/haskell-old-stg-syntax/)
