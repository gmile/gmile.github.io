---
layout: post
title:  Sieve of Atkin in Go
date:   2014-12-27 21:41:00
description: Trying out Go programming language
categories: development
---

Couple of months ago I was learning Go. Despite not being involved in learning it as of lately, I found it to be really refreshing after writing so long solely in Ruby. Below is an implementation of [Sieve of Atkin](http://en.wikipedia.org/wiki/Sieve_of_Atkin):

```go
package main
 
import (
  m "math" 
)
 
const LIMIT = 100
 
var (
  n, q, k uint
  x, y uint
)
 
func main() {
  prime_bools := [LIMIT + 1]bool{}
  sqrt        := int(m.Sqrt(LIMIT))
 
  for i := 0; i < 5; i++ {
    prime_bools[i] = true
  }
 
  for i := 1; i <= sqrt; i++ {
    for j := 1; j <= sqrt; j++ {
      x = uint(m.Pow(float64(i), 2))
      y = uint(m.Pow(float64(j), 2))
 
      n = 4*x + y
      if (n <= LIMIT) && (n % 12 == 1 || n % 12 == 5) { prime_bools[n] = !prime_bools[n] }
 
      n = 3*x + y
      if (n <= LIMIT) && (n % 12 == 7)                { prime_bools[n] = !prime_bools[n] }
 
      n = 3*x - y
      if (i > j) && (n <= LIMIT) && (n % 12 == 11)    { prime_bools[n] = !prime_bools[n] }
    }
  }
 
  for i := 5; i <= LIMIT; i++ {
    q = uint(m.Pow(float64(i), 2))
 
    if prime_bools[i] {
      for k = 1; k*q <= LIMIT; k++ {
        prime_bools[k*q] = false
      }
    }
  }
 
  println(2)
  println(3)
 
  for i := 5; i <= LIMIT; i++ {
    if prime_bools[i] { println(i) }
  }
}
```
