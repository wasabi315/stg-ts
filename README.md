# stg-ts
A toy stg interpreter in typescript

## Example
```sh
$ yarn start
```

```haskell
Program
  main = {} \u {} ->
      letrec
          20 = {} \u {} ->
              Int# {20#}

          res = {20} \u {} ->
              fact {20}
      in
          traceInt {res}

  fact = {} \n {n} ->
      letrec
          fact# = {fact#} \n {n#} ->
              case n# {} of
                  0# ->
                      1#

                  default ->
                      case -# {n#,1#} of
                          m# ->
                              case fact# {m#} of
                                  fm# ->
                                      *# {n#,fm#}
      in
          case n {} of
              Int# {n#} ->
                  case fact# {n#} of
                      fn# ->
                          Int# {fn#}

  traceInt = {} \n {n} ->
      case n {} of
          Int# {n#} ->
              traceLit# {n#}

Result
  traceLit#: 2432902008176640000
```
