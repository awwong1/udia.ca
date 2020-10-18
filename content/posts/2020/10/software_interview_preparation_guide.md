---
title: "Software Interview Preparation Guide"
date: 2020-10-13T10:35:42-06:00
draft: false
description: A quick, opinionated reference document for software developer/engineer technical interview.
status: in-progress
tags:
  - personal
  - python
  - software development
---

This document contains an overview of the minimum skillset required for the general software engineering candidate.
Many of the important points here are derived from the [Cracking the Coding Interview, 6th Edition](http://www.crackingthecodinginterview.com/) print.

We assume the use of the `python3` programming language.

# Non-Technical Competency

* [Smash Your Amazon Competency Interview](https://dayonecareers.substack.com/p/smash-your-amazon-competency-interview)
* [Interviewing at Amazon — Leadership Principles](https://medium.com/@scarletinked/are-you-the-leader-were-looking-for-interviewing-at-amazon-8301d787815d)

## STAR (SOAR)

Use the `STAR` method for responding to non technical competency questions.

* Situation
* Task (Objective)
* Action
* Response/Result

## Amazon Leadership Principles

Although [these principles](https://www.aboutamazon.com/working-at-amazon/our-leadership-principles) are tailored to Amazon, they form a solid foundation for competency interviews for all companies.

### Customer Obsession

Leaders start with the customer and work backwards. They work vigorously to earn and keep customer trust. Although leaders pay attention to competitors, they obsess over customers.

### Ownership

Leaders are owners. They think long term and don't sacrifice long-term value for short-term results. They act on behalf of the entire company, beyond just their own team. They never say "that's not my job."

### Invent and Simplify

Leaders expect and require innovation and invention from their teams and always find ways to simplify. They are externally aware, look for new ideas from everywhere, and are not limited by "not invented here." As we do new things, we accept that we may be misunderstood for long periods of time.

### Are Right, A Lot

Leaders are right a lot. They have strong business judgment and good instincts. They seek diverse perspectives and work to disconfirm their beliefs.

### Learn and Be Curious

Leaders are never done learning and always seek to improve themselves. They are curious about new possibilities and act to explore them.

### Hire and Develop the Best

Leaders raise the performance bar with every hire and promotion. They recognize exceptional talent, and willingly move them throughout the organization. Leaders develop leaders and take seriously their role in coaching others. We work on behalf of our people to invent mechanisms for development like Career Choice.

### Insist on the Highest Standards

Leaders have relentlessly high standards—many people may think these standards are unreasonably high. Leaders are continually raising the bar and driving their teams to deliver high-quality products, services, and processes. Leaders ensure that defects do not get sent down the line and that problems are fixed so they stay fixed.

### Think Big

Thinking small is a self-fulfilling prophecy. Leaders create and communicate a bold direction that inspires results. They think differently and look around corners for ways to serve customers.

### Bias for Action

Speed matters in business. Many decisions and actions are reversible and do not need extensive study. We value calculated risk taking.

### Frugality

Accomplish more with less. Constraints breed resourcefulness, self-sufficiency and invention. There are no extra points for growing headcount, budget size, or fixed expense.

### Earn Trust

Leaders listen attentively, speak candidly, and treat others respectfully. They are vocally self-critical, even when doing so is awkward or embarrassing. Leaders do not believe their or their team’s body odor smells of perfume. They benchmark themselves and their teams against the best.

### Dive Deep

Leaders operate at all levels, stay connected to the details, audit frequently, and are skeptical when metrics and anecdote differ. No task is beneath them.

### Have Backbone; Disagree and Commit

Leaders are obligated to respectfully challenge decisions when they disagree, even when doing so is uncomfortable or exhausting. Leaders have conviction and are tenacious. They do not compromise for the sake of social cohesion. Once a decision is determined, they commit wholly.

### Deliver Results

Leaders focus on the key inputs for their business and deliver them with the right quality and in a timely fashion. Despite setbacks, they rise to the occasion and never settle.

# Big O

**Big O** is a [notation for measuring the efficiency of algorithms](https://en.wikipedia.org/wiki/Big_O_notation).
It measures the upper bound of an algorithm's run time or space utilization relative to the input size.

Adhere to the following rules of thumb:

1. Drop the constants. (e.g. \\(O(2n) \rightarrow O(n)\\))
2. Drop the non-dominant terms. (e.g. \\(O(n^2 + n\log{n}) \rightarrow O(n^2)\\))
3. Runtime of typical recursive algorithms with multiple branches: \\(O(\text{branches}^\text{depth})\\)

## Reference Table

The notations are ranked from most efficient to least efficient.

| Notation          | Name          | Notes                                             |
|-------------------|---------------|---------------------------------------------------|
| \\(O(1)\\)        | constant      | Reference on a look-up table                      |
| \\(O(\log{n})\\)  | logarithmic   | Binary search on sorted array                     |
| \\(O(n)\\)        | linear        | Search on an unsorted array                       |
| \\(O(n\log{n})\\) | loglinear     | Merge sort runtime complexity                     |
| \\(O(n^2)\\)      | quadratic     | Bubble/Selection/Insertion sort                   |
| \\(O(n^c)\\)      | polynomial    | Tree-adjoining grammar parsing                    |
| \\(O(c^n)\\)      | exponential   | Exact Travelling Salesman (Dynamic Programming)   |
| \\(O(n!)\\)       | factorial     | Brute Force Search Travelling Salesman            |

## Examples

### ins_sort
```python3
def ins_sort(arr):
    for s_idx in range(1, len(arr)):                          # 1.
        s_val = arr[s_idx]
        for i_idx, c_val in enumerate(arr[:s_idx]):           # 2.
            if s_val < c_val:
                arr[i_idx + 1: s_idx + 1] = arr[i_idx:s_idx]  # 3.
                arr[i_idx] = s_val
                break
    return arr
```
We iterate through the array to `1.` find the elements to insert, then another time to `2.` find the position to insert.
Once the position is found, we `3.` perform an array slice assignment.
All inserts occur in place.\
This `ins_sort` has \\(O(n^3)\\) runtime complexity and \\(O(1)\\) space complexity.
```bash
$ python3 -m timeit -n 100 '([0] * 2000000)[1:2] = range(1)'
# 100 loops, best of 5: 9.13 msec per loop
$ python3 -m timeit -n 100 '([0] * 2000000)[1:20000] = range(19999, -1, -1)'
# 100 loops, best of 5: 11 msec per loop
$ python3 -m timeit -n 100 '([0] * 2000000)[1:200000] = range(199999, -1, -1)'
# 100 loops, best of 5: 53.7 msec per loop
$ python3 -m timeit -n 100 '([0] * 2000000)[1:2000000] = range(1999999, -1, -1)'
# 100 loops, best of 5: 191 msec per loop
```


### range_sum
```python3
def range_sum(n):
    """Return `n` + `n-1` + ... + `1`.
    """
    if n > 0:
        return n + range_sum(n-1)
    return 0

```
Each recursion adds an additional level to the stack.\
This `range_sum` implementation has \\(O(n)\\) runtime and space complexity.

```text
range_sum(5)
 -> range_sum(4)
     -> range_sum(3)
         -> range_sum(2)
             -> range_sum(1)
```

### two_exp
```python3
def two_exp(n):
    """Recursively calculate `2**n` for `n >= 0`.
    """
    if n > 0:
        return two_exp(n - 1) + two_exp(n - 1)
    return 1

```
Each recursion splits into two separate branches.\
This `two_exp` implementation has \\(O(2^n)\\) runtime and space complexity.
```text
                  two_exp(3)
                    /    \
            two_exp(2)  two_exp(2)
          /|                     |\
two_exp(1)  two_exp(1)  two_exp(1)  two_exp(1)
```

### memo_two_exp
```python3
def memo_two_exp(o_n):
    """Memoized recursive calculation of `2**n` for `n >= 0`.
    """
    cache = {0: 1}
    def _two_exp(n):
        if n in cache:
            return cache[n]
        if n > 0:
            cache[n] = _two_exp(n - 1) + _two_exp(n - 1)
        return cache.get(n, 1)
    return _two_exp(o_n)

```
Each recursion splits into two separate branches, but one of the branches is guaranteed to hit the cache.\
This `memo_two_exp` implementation has \\(O(n)\\) runtime and space complexity.
```text
                  two_exp(3)
                    /    \
            two_exp(2)  # two_exp(2) cached
          /|
two_exp(1)  # two_exp(1) cached
```


# Data Structures

## Linked Lists

The standard library implementation, [`collections.deque`](https://docs.python.org/3.7/library/collections.html#collections.deque), is a doubly linked list supporting efficient `O(1)` appends and pops for either side of the deque.

```python3
from collections import deque

dll = deque([1, 2, 3])      # [1, 2, 3]
dll.append(200)             # [1, 2, 3, 200]
dll.appendleft(-789)        # [-789, 1, 2, 3, 200]
dll.pop()                   # [-789, 1, 2, 3]
dll.popleft()               # [1, 2, 3]
dll.extendleft(["A", "B"])  # ["B", "A", 1, 2, 3]
dll.extend(["Y", "Z"])      # ["B", "A", 1, 2, 3, "Y", "Z"]

```

### Implementation

```python3
class LinkedList(object):
    """Custom linked list implementation.
    You probably want `collections.deque` instead.
    """

    class Node(object):
        def __init__(self, data, prev_node=None, next_node=None):
            self.data = data
            self.prev = prev_node
            self.next = next_node

    def __init__(self, iterable=[]):
        """
        Initialize a linked list from an iterable.
        O(n) initialization time.
        """
        self.len = len(iterable)
        iterator = iter(iterable)
        # Create the doubly linked list, requires a forward and backwards pass
        # head to tail iteration, creates tail -> head linked nodes
        while True:
            try:
                cur_val = next(iterator)
                try:
                    t_cur_node = LinkedList.Node(cur_val, prev_node=t_cur_node)
                except NameError:
                    # on the first element, t_cur_node is not defined
                    t_cur_node = LinkedList.Node(cur_val)
            except StopIteration:
                break

        try:
            self.tail = t_cur_node
        except NameError:
            # iterable was empty
            self.tail = None

        # tail to head iteration, creates head -> linked nodes
        head_cur_node = self.tail
        while True:
            try:
                head_cur_node.next = h_cur_node
            except NameError:
                # on the last element, h_cur_node is not defined
                pass
            finally:
                h_cur_node = head_cur_node

            if h_cur_node is None or h_cur_node.prev is None:
                # we've reached the head again
                head_cur_node = h_cur_node
                break
            head_cur_node = h_cur_node.prev

        self.head = head_cur_node

    def append(self, val):
        """
        Append a new value to the right of the linked list.
        O(1) time.
        """
        cur_tail = self.tail
        if cur_tail is None:
            new_tail = LinkedList.Node(val)
            self.head = new_tail
        else:
            new_tail = LinkedList.Node(val, prev_node=cur_tail)
            cur_tail.next = new_tail
        self.tail = new_tail
        self.len += 1

    def pop(self):
        """
        Remove and return an element from the right side of the linked list.
        If no elements are present, raises an IndexError.
        O(1) time.
        """
        if self.tail is None:
            raise IndexError("pop from empty linked list")
        to_pop = self.tail
        self.tail = to_pop.prev
        if self.tail is not None:
            self.tail.next = None
        if to_pop == self.head:
            self.head = None
        self.len -= 1
        return to_pop.data

    def appendleft(self, val):
        """
        Append a new value to the left of the linked list.
        O(1) time.
        """
        cur_head = self.head
        if cur_head is None:
            new_head = LinkedList.Node(val)
            self.tail = new_head
        else:
            new_head = LinkedList.Node(val, next_node=cur_head)
            cur_head.prev = new_head
        self.head = new_head
        self.len += 1

    def popleft(self):
        """
        Remove and return an element from the left side of the linked list.
        If no elements are present, raises an IndexError.
        O(1) time.
        """
        if self.head is None:
            raise IndexError("popleft from empty linked list")
        to_pop = self.head
        self.head = to_pop.next
        if self.head is not None:
            self.head.prev = None
        if to_pop == self.tail:
            self.tail = None
        self.len -= 1
        return to_pop.data

    def index(self, x):
        """
        Return the position of x in the linked list in O(n) time.
        Returns the first match or raises ValueError if not found.
        """
        cur_node = self.head
        idx = 0
        while cur_node and cur_node.data != x:
            cur_node = cur_node.next
            idx += 1
        if cur_node:
            return idx
        raise ValueError(f"{x} is not in linked list")

    def __iter__(self):
        # return a head to tail travelling iterator.
        cur_node = self.head
        while type(cur_node) == LinkedList.Node:
            yield cur_node.data
            cur_node = cur_node.next

    def __len__(self):
        return self.len

```

## Stacks and Queues

The stack (last-in, first-out) and queue (first-in, first-out) data structures are trivially implemented using the `list` builtin or the linked list data structure.
The appends and pops have `O(1)` time complexity.

### Implementation

```python3
# Simple stack, using a list
stack = list()
stack.append("A")  # add to stack
stack.pop()        # remove from stack

# Simple queue, using deque
from collections import deque
lifo_queue = deque()        # LinkedList() will also work
lifo_queue.appendleft("A")  # add to queue
lifo_queue.pop()            # remove from queue
```

## Graphs, Trees, Heaps, Tries

Python does not have a standard library graph implementation. A simple graph can be constructed using a dictionary and lists and serves as the base data structure.

A `tree` is a connected graph without cycles. A node is called a leaf node if it has no children.\
A `binary tree` is a tree where each node has up to two neighbors/children.\
A `binary search tree` is a binary tree where each node satisfies the condition: `all_left_descendents <= n < all_right_descendents`.\
A `complete binary tree` is where each level of the tree is fully filled from left to right. The last level may not be full filled, but the nodes must still satisfy the left to right property.\
A `full binary tree` is where all nodes have either zero or two children.\
A `perfect binary tree` is where all interior nodes have two children and all leaf nodes are on the same level.

A `min-heap` is a complete binary tree where each node is smaller than its children.\
A `max-heap` is a complete binary tree where each node is greater than its children.

A `trie`, or a prefix tree, is an n-ary tree where all leaf nodes are semantically terminating nodes.
One common use case is to store of English language prefix lookups.

![Trie Example](https://media.udia.ca/2020/10/13/trie.png "Trie: HELP HI BYE A")

### Implementation

```python3
class Graph(object):
    def __init__(self, edges=[], nodes=[]):
        """Construct a simple directional graph.
        Nodes can be inferred from edges.
        All values must be hashable.
        """
        self.data = {}
        for node in nodes:
            self.add_node(node)
        for (from_node, to_node) in edges:
            self.add_edge(from_node, to_node)

    def nodes(self):
        return list(self.data.keys())

    def neighbors(self, node):
        return list(self.data.get(node, []))

    def add_node(self, node):
        if node not in self.data:
            self.data[node] = []

    def add_edge(self, from_node, to_node):
        if from_node in self.data:
            self.data[from_node].append(to_node)
        else:
            self.data[from_node] = [to_node, ]
        self.add_node(to_node)

```

## Hash Tables

A hash table (a.k.a. hashmap) is provided by Python's `dict` built-in.

```python3
hm = {}            # dict()
hm["foo"] = "bar"  # {"foo": "bar"}
```

### Implementation

```python3
class HashTable(object):
    """Custom hash table implementation.
    Use the built-in `dict()` and `{}` instead.
    """

    def __init__(self, lut_len=2):
        super(HashTable, self).__init__()

        self.lut_len = lut_len
        self.lut = [[] for _ in range(lut_len)]
        self.keys_len = 0

    def __getitem__(self, key):
        """Ammoritized lookup of O(1)"""
        lut_idx = hash(key) % self.lut_len
        for lut_key, lut_val in self.lut[lut_idx]:
            if lut_key == key:
                return lut_val
        raise KeyError(key)

    def __setitem__(self, key, value):
        """Ammoritized set of O(1)"""
        lut_idx = hash(key) % self.lut_len
        for lut_iidx, (lut_key, _) in enumerate(self.lut[lut_idx]):
            if lut_key == key:
                self.lut[lut_idx][lut_iidx] = (key, value)
                break
        else:
            self.lut[lut_idx].append((key, value))
            self.keys_len += 1

            if self.keys_len > self.lut_len:
                self._rebalance()

    def __delitem__(self, key):
        """Ammoritized delete of O(1)"""
        lut_idx = hash(key) % self.lut_len
        llut_idx = 0
        for lut_key, _ in self.lut[lut_idx]:
            if lut_key == key:
                break
            llut_idx += 1
        self.lut[lut_idx].pop(llut_idx)
        self.keys_len -= 1

    def __contains__(self, key):
        try:
            self[key]
            return True
        except KeyError:
            return False

    def _rebalance(self):
        """Double the lookup table's size"""
        new_lut_len = self.lut_len * 2
        new_lut = [[] for _ in range(new_lut_len)]
        for sub_lut in self.lut:
            for key, value in sub_lut:
                new_lut_idx = hash(key) % new_lut_len
                for new_lut_iidx, (lut_key, _) in enumerate(new_lut[new_lut_idx]):
                    if lut_key == key:
                        new_lut[new_lut_idx][new_lut_iidx] = (key, value)
                        break
                else:
                    # break was not called
                    new_lut[new_lut_idx].append((key, value))
        self.lut_len = new_lut_len
        self.lut = new_lut
```

# Algorithms

## BFS/DFS

Breadth First Search (BFS) and Depth First Search (DFS) are two different ways to traverse a graph.

![BFS/DFS Reference Graph](https://media.udia.ca/2020/10/13/bfs_dfs.png "Reference graph for BFS, DFS example. Neighbors are iterated in numerical order.")

| Step  | Breadth First Search  | Depth-First-Search    |
|-------|-----------------------|-----------------------|
| 0     | `Node 0`              | `Node 0`              |
| 1     | `Node 1`              | `-Node 1`             |
| 2     | `Node 4`              | `--Node 3`            |
| 3     | `Node 5`              | `---Node 2`           |
| 4     | `Node 3`              | `---Node 4`           |
| 5     | `Node 2`              | `-Node 5`             |

### Implementation

Our BFS/DFS algorithm relies on the [Graph]({{< relref "#implementation-2" >}}) implementation above.

```python3
from collections import deque


class IteratorBFS(object):
    def __init__(self, graph, start):
        self.graph = graph
        self.to_visit = deque([start, ])
        self.visited = set()

    def __iter__(self):
        while self.to_visit:
            cur = self.to_visit.pop()   # First In, First out
            if cur in self.visited:
                continue
            for neighbor in self.graph.neighbors(cur):
                if neighbor not in self.visited:
                    self.to_visit.appendleft(neighbor)
            self.visited.add(cur)
            yield cur


class IteratorDFS(object):
    def __init__(self, graph, start):
        self.graph = graph
        self.to_visit = deque([start, ])
        self.visited = set()

    def __iter__(self):
        while self.to_visit:
            cur = self.to_visit.popleft()   # First In, Last out
            if cur in self.visited:
                continue
            # reversed to preserve order of edges, but not 100% necessary
            for neighbor in reversed(self.graph.neighbors(cur)):
                if neighbor not in self.visited:
                    self.to_visit.appendleft(neighbor)
            self.visited.add(cur)
            yield cur

```
```python3
g = Graph(
    edges=[
        ("0", "1"),
        ("0", "4"),
        ("0", "5"),
        ("1", "3"),
        ("1", "4"),
        ("2", "1"),
        ("3", "2"),
        ("3", "4"),
    ]
)

iterator = IteratorBFS(g, "0")
# next(iterator)  # Step by step search. "0"
assert list(iterator) == ["0", "1", "4", "5", "3", "2"]

iterator = IteratorDFS(g, "0")
assert list(iterator) == ["0", "1", "3", "2", "4", "5"]

```

## Merge Sort

The [merge sort algorithm](https://en.wikipedia.org/wiki/Merge_sort).
The runtime of this implementation is \\(O(n\log{n})\\) with \\(O(n)\\) space complexity.

### Implementation

```python3
def mergesort(arr):
    """Recursive implementation of Mergesort.
    """
    if len(arr) >= 2:
        left = mergesort(arr[:len(arr) // 2])
        right = mergesort(arr[len(arr) // 2:])

        left_i = 0
        right_i = 0
        merged = []
        while left_i < len(left) and right_i < len(right):
            if left[left_i] > right[right_i]:
                merged.append(right[right_i])
                right_i += 1
            else:
                merged.append(left[left_i])
                left_i += 1
        return merged + left[left_i:] + right[right_i:]
    return arr
```

## Quicksort

The [quicksort algorithm](https://en.wikipedia.org/wiki/Quicksort).
The runtime of this implementation is \\(O(n\log{n})\\) with \\(O(n)\\) space complexity.

### Implementation

```python3
def quicksort(m_arr):
    """Recursive implementation of Quicksort."""

    def _partition(arr, lo, hi):
        pos = lo
        for i in range(lo, hi):
            if arr[i] < arr[hi]:
                arr[i], arr[pos] = arr[pos], arr[i]
                pos += 1
        # put the pivot back
        arr[pos], arr[hi] = arr[hi], arr[pos]
        return pos

    def _quicksort(arr, lo=0, hi=None):
        if hi is None:
            hi = len(arr) - 1
        if lo < hi:
            p = _partition(arr, lo, hi)
            _quicksort(arr, lo=lo, hi=p - 1)
            _quicksort(arr, lo=p + 1, hi=hi)

    _quicksort(m_arr)
    return m_arr
```
