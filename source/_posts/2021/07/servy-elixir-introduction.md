----
title: Elixir Introduction with Servy
draft: false
description: An Introduction to Elixir programming language using the Servy web application.
tags:
  - elixir
  - programming
date: 2021-07-06 14:59:00
----

# Servy

This post is a summary of the excellent introductory course to Elixir from [The Pragmatic Studio](https://pragmaticstudio.com/courses/elixir).
Please also refer to the [source code for Servy](https://git.sr.ht/~udia/servy), where all of this is documented again in the README file.

## High-Level Transformations

```elixir
def handle(request) do
  conv = parse(request)
  conv = route(conv)
  format_response(conv)
end

# equivalent
def handle(request) do
  request
  |> parse
  |> route
  |> format_response
end
```

## Simple Pattern Matching

```elixir
[1, 2, 3] = [1, 2, 3]
[first, 2, last] = [1, 2, 3]
# first is 1, last is 3
[first, 4, last] = [1, 2, 3]
# MatchError
[first, last] = [1, 2, 3]
# Match Error
```

## Immutable Data

All objects in Elixir are immutable.

```elixir
conv = %{ method: "GET", path: "/wildthings" }

# can access using get square bracket with atom key
"GET" = conv[:method]
"/wildthings" = conv[:path]
nil = conv[:request_body]

# for atom keys, can also use dot notation, but will raise error if not exist
"GET" = conv.method
"/wildthings" = conv.path
conv.request_body # KeyError
```

## Function Clauses

Rather than using conditional statements (if/elif/else), it is more idiomatic in Elixir to write function clauses.

```elixir
def route(conv) do
  if conv.path == "/wildthings" do
    %{conv | resp_body: "Bears, Liöns, Tigers"}
  else
    if conv.path == "/bears" do
      %{conv | resp_body: "Teddy, Smokey, Paddington"}
    else
      %{conv | resp_body: "idk"}
    end
  end
end
```

can be rewritten as

```elixir
def route(conv), do: route(conv, conv.path)

def route(conv, "/wildthings") do
  %{conv | resp_body: "Bears, Liöns, Tigers"}
end

def route(conv, "/bears") do
  %{conv | resp_body: "Teddy, Smokey, Paddington"}
end

def route(conv, _path) do
  %{conv | resp_body: "idk"}
end
```

## Additional Pattern Matching

All related function clauses should be grouped together.
They are evaluated in the order defined in the source code, so putting the catch all at the top will effectively make the other function clauses inaccessible.

Additionally, match operators can be used within a function clause.

```elixir
# will match all paths containing "/bears/anyvalue/here"
def route(conv, "GET", "/bears/" <> id) do
  %{conv | status: 200, resp_body: "Bear #{id}"}
end
```

## Advanced Pattern Matching

Rather than transforming `route/1` into `route/3` function clauses, we can modify `route/1` to accept a map and perform pattern matching on the individual keys.

```elixir
# def route(conv, "GET", "/wildthings") do # becomes
def route(%{method: "GET", path: "/wildthings"} = conv) do
  %{conv | status: 200, resp_body: "Bears, Liöns, Tigers"}
end
```

Cannot do string concatenation match with dynamic length variable in non tail position. Example overcoming this limitation using Regexp:

```elixir
# def rewrite_path(%{path: "/" <> thing <> "?id=" <> id} = conv) do # error
def rewrite_path(%{path: path} = conv) do
  regex = ~r{\/(?<thing>\w+)\?id=(?<id>\d+)}
  captures = Regex.named_captures(regex, path)
  rewrite_path_captures(conv, captures)
end

def rewrite_path_captures(conv, %{"thing" => thing, "id" => id}) do
  %{conv | path: "/#{thing}/#{id}"}
end

def rewrite_path_captures(conv, nil), do: conv
```

## Reading a File, Case Operator

Function clauses can be written as a case conditional.
```elixir
def route(%{method: "GET", path: "/about"} = conv) do
  # Get the absolute path of the pages file, relative to current file's directory
  Path.expand("../../pages", __DIR__)
  |> Path.join("about.html")
  |> File.read()
  |> handle_file(conv)
end

defp handle_file({:ok, content}, conv) do
  %{conv | status: 200, resp_body: content}
end

defp handle_file({:error, :enoent}, conv) do
  %{conv | status: 404, resp_body: "File not found!"}
end

defp handle_file({:error, reason}, conv) do
  %{conv | status: 500, resp_body: "File error: #{reason}"}
end
```

Using case instead of function clauses.

```elixir
def route(%{method: "GET", path: "/about"} = conv) do
  # Get the absolute path of the pages file, relative to current file's directory
  file_path =
    Path.expand("../../pages", __DIR__)
    |> Path.join("about.html")

  case File.read(file_path) do
    {:ok, content} ->
      %{conv | status: 200, resp_body: content}

    {:error, :enoent} ->
      %{conv | status: 404, resp_body: "File not found!"}

    {:error, reason} ->
      %{conv | status: 500, resp_body: "File error: #{reason}"}
  end
end
```

The `__DIR__` variable holds the existing file's directory path, relative to where the program session was started.

## Module Attributes

Elixir modules have two built in module attributes, `@moduledoc` for the module-level documentation string, and `@doc` for the function level documentation.

```elixir
defmodule Sample.Module do
  @moduledoc """
  My module level documentation.
  """

  @hello_output "world"

  @doc "outputs 'world', module-level attributes set on compile"
  def hello, do: IO.puts(@hello_output)

  @hello_output "is valid"

  @doc """
  outputs 'This is valid'.
  """
  def wow do
    IO.puts("This #{@hello_output}")
  end
end
```

## Code Reorganization

An elixir project spanning multiple files can be run in interactive mode using `iex -S mix`. Calling individual modules will not correctly compile the dependent modules.

The module naming convention does not imply hierarchy. To reference functions in other modules, you can call the function using `{module name}.{function}` or by importing the function into the current scope.

```elixir
defmodule Sample.Plugins do
  def foo, do: "whoa"
  def bar, do: "bruh"
end

defmodule Sample.Module do
  import Sample.Plugins, only: [foo: 0]
  def hello do
    IO.puts("#{foo()}, #{Sample.Plugins.bar()}")
  end
end
```

When importing modules, the `only` option specifies specific functions (provide the function arity) instead of importing everything.
Alternative imports:

```elixir
# import all of the functions only
import SomeModule, only: :functions

# import all of the macros only (`defmacro`)
import SomeModule, only: :macros
```

## Struct Usage

Rather than using a map (`%{}`) it can be useful to define the keys beforehand to ensure more strict semantics.
Structs are defined within their own module- a module cannot have more than one struct.
Structs are maps that allow default values for keys and compile time assertions.

```elixir
defmodule Servy.Conv do
  defstruct method: "", path: "", resp_body: "", status: nil

  def full_status(conv) do
    "#{conv.status} #{status_reason(conv.status)}"
  end

  defp status_reason(code) do
    %{
      200 => "OK",
      201 => "Created",
      401 => "Unauthorized",
      403 => "Forbidden",
      404 => "Not Found",
      500 => "Internal Server Error"
    }[code]
  end
end
```

The `defstruct` macro takes in a list of fields which are the atom keys. If a list of atoms are provided, they will all default to `nil`.
```elixir
defmodule Post do
  defstruct [:title, :content, :author]
end
```

See `h defstruct` for more information.

## Matching Heads and Tails

Using the `|` operator on a list will separate out the first element from the rest of the list.

```elixir
nums = [1, 2, 3, 4, 5]
[head | tail] = nums
head == 1
tail == [2, 3, 4, 5]

[head | tail] = tail
head == 2
tail == [3, 4, 5]

[head | tail] = tail
head == 3
tail == [4, 5]

[head | tail] = tail
head == 4
tail == [5]

[head | tail] = tail
head == 5
tail == []

[head | tail] = tail
# MatchError
```

Additionally access to the head and the tail can also be done using the functions `hd` and `tl`.

```elixir
nums = [1, 2, 3]
hd(nums)
# 1
tl(nums)
# [2, 3]
```

## Recursion

Elixir does not have looping, instead traversal of iterables is done through recursion.

```elixir
defmodule Recurse do
  def loopy([head | tail]) do
    IO.puts "Head: #{head} Tail: #{inspect(tail)}"
    loopy(tail)
  end
  def loopy([]), do: IO.puts "Done!"
end

Recurse.loopy([1, 2, 3, 4, 5])
# Head: 1 Tail: [2, 3, 4, 5]
# Head: 2 Tail: [3, 4, 5]
# Head: 3 Tail: [4, 5]
# Head: 4 Tail: [5]
# Head: 5 Tail: []
# Done!
```

Or with state, like summing the numbers together:

```elixir
# no additional state
defmodule Recurse do
  def sum([head | tail]) do
    head + sum(tail)
  end
  def sum([]), do: 0
end

Recurse.sum([1, 2, 3, 4, 5])

# keep track of a running total (more efficient! uses tail-call optimization)
defmodule Recurse do
  def sum([head | tail], total) do
    IO.puts "Total: #{total} Head: #{head} Tail: #{inspect(tail)}"
    sum(tail, total + head)
  end

  def sum([], total), do: total
end

IO.puts Recurse.sum([1, 2, 3, 4, 5], 0)
```

Triple all the numbers in a list:
```elixir
# stacking function calls
defmodule Recurse do
  def triple([head | tail]) do
    [3 * head | triple(tail)]
  end
  def triple([]), do: []
end

Recurse.triple([1, 2, 3, 4, 5])

# more efficient tail-call optimization approach
defmodule Recurse do
  def triple([head | tail], partial) do
    triple(tail, Enum.concat(partial, [head * 3]))
  end
  def triple([], partial), do: partial
end

Recurse.triple([1, 2, 3, 4, 5], [])

# what the course suggested to do
defmodule Recurse do
  def triple(list) do
    triple(list, [])
  end

  defp triple([head|tail], current_list) do
    triple(tail, [head*3 | current_list])
  end

  defp triple([], current_list) do
    current_list |> Enum.reverse()
  end
end

IO.inspect Recurse.triple([1, 2, 3, 4, 5])
```

## Slicing and Dicing with Enum

```elixir
# Ampersand operator for simplifying anonymous function to named function
phrases = ["lions", "tigers", "bears", "oh my"]
Enum.map(phrases, fn(x) -> String.upcase(x) end)
# ["LIONS", "TIGERS", "BEARS", "OH MY"]

# Equivalent!
Enum.map(phrases, &String.upcase(&1))
# ["LIONS", "TIGERS", "BEARS", "OH MY"]

# Also Equivalent!
Enum.map(phrases, &String.upcase/1)
# ["LIONS", "TIGERS", "BEARS", "OH MY"]
```

The ampersand wraps a named function in an anonymous function, and the numbers indicate the argument order.
This can also be done with expressions.

```elixir
add2 = fn(a, b) -> a + b end
add2.(1, 2)
# 3

#equivalent
add2 = &(&1 + &2)
add2.(3, 4)
# 7
```

Consider these examples for capturing `String.duplicate/2`:

```elixir
String.duplicate("foo", 3)
# "foofoofoo"

dup = fn(string, num) -> String.duplicate(string, num) end
dup.("foo", 3)
# "foofoofoo"

dup = &String.duplicate(&1, &2)
dup.("foo", 3)
# "foofoofoo"

dup = &String.duplicate/2
dup.("foo", 3)
# "foofoofoo"
```

### Guard Clauses

These are conditionals that you can define at the function argument level that [sets boolean checks on the argument types for function clause matching](https://hexdocs.pm/elixir/patterns-and-guards.html#list-of-allowed-functions-and-operators).

```elixir
defmodule Doubler do
  def get_double_value(inp) when is_integer(inp) do
    inp * 2
  end
  def get_double_value(inp) when is_binary(inp) do
    inp |> String.to_integer |> get_double_value
  end
end

Doubler.get_double_value(30)
# 60
Doubler.get_double_value("40")
# 80
```

## Comprehensions

```elixir
Enum.map([1, 2, 3], fn(x) -> x * 3 end)
# [3, 6, 9]

for x <- [1, 2, 3], do: x * 3
# [3, 6, 9]
```

In this above example, the generator is `x <- [1, 2, 3]`.
An example with two generators is shown:

```elixir
for size <- ["S", "M", "L"], color <- [:red, :blue], do: {size, color}

[
  {"S", :red},
  {"S", :blue},
  {"M", :red},
  {"M", :blue},
  {"L", :red},
  {"L", :blue}
]
```

You can also pattern match within comprehensions:

```elixir
prefs = [ {"Betty", :dog}, {"Bob", :dog}, {"Becky", :cat} ]
for {name, :dog} <- prefs, do: name
["Betty", "Bob"]

# More explicit equivalent
for {name, pet_choice} <- prefs, pet_choice == :dog, do: name
["Betty", "Bob"]

# Using a function as the predicate expression
cat_lover? = fn(choice) -> choice == :cat end
for {name, pet_choice} <- prefs, cat_lover?.(pet_choice), do: name
["Becky"]
```

By default, values returned by a `do` block of a comprehension are packaged into a list. However, the `:into` option can return the values into anything that inherits `Collectable`.

```elixir
style = %{"width" => 10, "height" => 20, "border" => "2px"}

# This is what we want to do, but how to make this a comprehension?
Map.new(style, fn {key, val} -> {String.to_atom(key), val} end)
%{border: "2px", height: 20, width: 10}

# this outputs a list
for {key, val} <- style, do: {String.to_atom(key), val}
[border: "2px", height: 20, width: 10]

# this outputs a map (notice the :into)
for {key, val} <- style, into: %{}, do: {String.to_atom(key), val}
%{border: "2px", height: 20, width: 10}
```

See an example using a deck of playing cards:

```elixir
ranks =
  [ "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" ]

suits =
  [ "♣", "♦", "♥", "♠" ]

# Show all cards
all_cards = for rank <- ranks, suit <- suits, do: {rank, suit}
IO.inspect(all_cards)

# Shuffle and deal out a single hand of 13 random cards
all_cards |> Enum.shuffle |> Enum.slice(0, 13)

# Shuffle and deal out four hands of 13 cards each
all_cards |> Enum.shuffle |> Enum.chunk_every(13)
```

### EEx Templates

```eex
<h1>All The Bears!</h1>

<ul>
  <%= for bear <- bears do %>
  <li><%= bear.name %> - <%= bear.type %></li>
  <% end %>
</ul>
```

The notice the subtle differences in the opening expression tags `<%=` and `<%`.
In EEx, all expressions that output something to the template must include the equals `=` sign.

## Test Automation

By default, setting up a `mix` project will generate a `test` directory that uses [`ExUnit`](https://hexdocs.pm/ex_unit/master/ExUnit.html) for testing.

```bash
# to run a specific test file
mix test test/handler_test.exs

# to run all test cases test/*_test.exs
mix test

# to run a specific test that is failing, set the line number of the given test
mix test test/handler_test.exs:7

mix help test
```

## Rendering JSON

The video tutorial uses Poison, but I used [Jason](https://hexdocs.pm/jason/readme.html) instead.
TODO: Look up [Protocol Module Consolidation](https://hexdocs.pm/elixir/Protocol.html#module-consolidation)

```elixir
Jason.encode!(%{"age" => 44, "name" => "Steve Irwin", "nationality" => "Australian"})
"{\"age\":44,\"name\":\"Steve Irwin\",\"nationality\":\"Australian\"}"
```

To use external libraries, add it to the dependencies list in `mix.exs`. Then run `mix deps.get`.

## Web Server Sockets

All [`Erlang` libraries](http://erlang.org/doc/man/) can be used in `Elixir` projects because Elixir is transpiled into erlang bytecode to be run in an erlang virtual machine.

Example of converting erlang code into elixir code:

```erlang
server() ->
  {ok, LSock} = gen_tcp:listen(5678, [binary, {packet, 0},
                                      {active, false}]),
  {ok, Sock} = gen_tcp:accept(LSock),
  {ok, Bin} = do_recv(Sock, []),
  ok = gen_tcp:close(Sock),
  ok = gen_tcp:close(LSock),
  Bin.
```
```elixir
defmodule Servy.OldHttpServer do
  def server do
    # {:ok, lsock} = :gen_tcp.listen(5678, [:binary, {:packet, 0}, {:active, false}])
    {:ok, lsock} = :gen_tcp.listen(5678, [:binary, packet: 0, active: false])
    {:ok, sock} = :gen_tcp.accept(lsock)
    {:ok, bin} = :gen_tcp.recv(sock, 0)
    :ok = :gen_tcp.close(sock)
    :ok = :gen_tcp.close(lsock)
    bin
  end
end
```

* Erlang atoms have a lowercase letter start. Elixir atoms start with a colon (`:`) character.
* Erlang variables start with an uppercase letter. Elixir atoms start with a lowercase letter.
* Erlang modules are referenced as atoms. E.g. Erlang `gen_tcp` becomes Elixir `:gen_tcp`.
* Erlang function calls use a colon (`:`) while Elixir function calls use a dot (`.`). E.g. Erlang `gen_tcp:listen` becomes Elixir `:gen_tcp.listen`
* Erlang strings are not Elixir strings. Erlang `"hello"` becomes Elixir `'hello'`
    * Erlang, double-quoted strings are a list of characters. 
    * Elixir: double quoted strings are a sequence of bytes.
    To make a list of characters, use a single qoted string.

Wrote a quick webserver using `gen_tcp` to hook into our existing handler and serve responses to a http client (such as a web browser).

## Concurrent, Isolated Processes

Within Elixir, the `spawn` function is used to create a processes that runs concurrently in the background.

```elixir
# spawn/1
spawn(fn() -> IO.puts "Hello world" end)

# spawn/3
spawn(IO, :puts, ["Hello world"])
```

* `spawn/1` takes a zero-arity anonymous function.
* `spawn/3` takes the module name, the function name as an atom, and a list of arguments passed to the function.

The functions spawned in the serve function are closures.
All variables that are defined within the scope of the function are deep copied. Processes do not share memory.

To get the PID of the current process, use `self()`.
```elixir
IO.puts "Current PID: #{inspect self()}"
```

We can count the number of Elixir processes like so:
```elixir
Process.list |> Enum.count
# equivalent
:erlang.system_info(:process_count)
```

Refer to the Erlang [system_info](http://erlang.org/doc/man/erlang.html#system_info-1) function for more details.

Within an `iex` session, the `:observer.start` function will open up a graphical user interface enabling you to inspect overall system information and the individual Erlang/Elixir processes currently running in the application.

## Sending and Receiving Messages

Elixir processes (are not operating system processes and) have the following properties:

- extremely lightweight and fast to spawn
- run concurrently on a single CPU
    - if multiple CPU cores are available, runs in parallel
- isolated from other processes (no sharing of memory or variables)
- have their own private mailbox
- communicate with other processes only by sending and receiving messages

```elixir
parent = self()

# spawn three children processes to send messages to the parent
spawn(fn -> send(parent, "Yes") end)
spawn(fn -> send(parent, "No") end)
spawn(fn -> send(parent, "Maybe") end)

# the messages currently in the parent process mailbox
Process.info(parent, :messages)
# {:messages, ["Yes", "No", "Maybe"]}

receive do msg -> msg end
# "Yes"

Process.info(parent, :messages)
# {:messages, ["No", "Maybe"]}

flush
# "No"
# "Maybe"
# :ok
```

## Asynchronous Tasks

It is common practice to keep track of process IDs when working with asynchronous tasks in order to map message results back to their originating spawn call.
Elixir provides a convenience function for dispatching asynchonous commands and retrieving the corresponding results.

```elixir
task = Task.async(fn -> Servy.Tracker.get_location("bigfoot") end)
Task.await(task)  # by default, times out after 5 seconds raising exception

task = Task.async(Servy.Tracker, :get_location, ["bigfoot"])
Task.await(task, 7000)  # will wait for 7 seconds before timing out raising exception

task = Task.async(fn -> Servy.Tracker.get_location("bigfoot") end)
Task.await(task, :infinity)  # indefinite block
```

Because `Task.await` waits for a message to arrive it can only be called once for a given task.
Use `Task.yield` to determine if a task has completed.

```elixir
task = Task.async(fn -> :timer.sleep(8000); "Done!" end)

# waits 5 seconds and returns nil due to task not finishing within cutoff time
Task.yield(task, 5000)
nil

Task.yield(task, 5000)
{:ok, "Done!"}
```

If working with a `receive` block, consider setting a timeout using the `after` clause. 
```elixir
pid = Fetcher.async(fn -> Servy.Tracker.get_location("bigfoot") end)
Fetcher.get_result(pid)

# Will timeout after 2 seconds
def get_result(pid) do
  receive do
    {^pid, :result, value} -> value
  after 2000 ->
    raise "Timed out!"
  end
end
```

### Converting Milliseconds

Erlang timer module has useful built-in millisecond conversion functions.
```elixir
:timer.seconds(5)
5000

:timer.minutes(5)
300000

:timer.hours(5)
18000000
```

## Stateful Server Processes

Within Elixir, modules cannot store state (in most OO languages, you can have class attributes that are shared among all instances of the class).
Instead, you need to spawn a process and pass state into the process by arguments.

### Registering Unique Process Names

```elixir
# Store the registered name of the PID as a module level constant
@name :pledge_server
# Register the PID under this name
Process.register(pid, @name)
# Then send to this name rather than the PID
send @name, {self(), :create_pledge, name, amount}

# an error will be raised if another attempt to register using the same name is made
Process.register(pid2, @name)
```

Referring to the `Servy.PledgeServer.start/0` function we registered the spawned process under the name `:pledge_server`.
```elixir
Servy.PledgeServer.start()
#PID<0.200.0>

# Determine the PID registered under a name
Process.whereis(:pledge_server)
#PID<0.200.0>

# Unregistering a process name can also be done
Process.unregister(:pledge_server)
#true

Process.whereis(:pledge_server)
#nil
```

### Agents

The [Agent](https://hexdocs.pm/elixir/Agent.html) module is a simple wrapper around a server process that can store state and offers access to the state via a client interface.

```elixir
iex> {:ok, agent} = Agent.start(fn -> [] end)
{:ok, #PID<0.90.0>}
```

A process is spawned containing an elixir list in memory. The agent is bound to a PID.

```elixir
iex> Agent.update(agent, fn(state) -> [ {"larry", 10} | state ] end)
:ok
iex> Agent.update(agent, fn(state) -> [ {"moe", 20} | state ] end)
:ok
```

Additional calls for updating the state are provided. Pass in a function that takes the state and returns the new state.

```elixir
iex> Agent.get(agent, fn(state) -> state end)
[{"moe", 20}, {"larry", 10}]
```

To retrieve the agent's state, pass the agent's PID and a function that returns the state.

## Refactoring Towards GenServer

In our `Servy.PledgeServer` example, we refactored our module such that all 'Generic Server' behaviour is defined in the `Servy.GenericServer` module.
It supports initialization via `start/3` (taking in the callback module, initial state, and name).
It handles blocking actions via `call/2` as well as non-blocking actions via `cast/2` (both taking in the server PID and message as arguments).
The server `listen_loop/2` will handle listening for new call and cast messages, referencing the callback module's functions for server side logic.

## OTP GenServer

- `Task`: For one-off computations or queries
- `Agent`: For a simple process that holds state
- `GenServer`: For long-running server processes that stores state and performs work concurrently
    - If you need to serialize access to a shared resource or service, `GenServer` is a decent choice
    - If you need to schedule background work to be performed on a periodic interval, `GenServer` is a decent choice

### GenServer callback functions

- `handle_call(message, from state)`
    - Invoked to handle **synchronous** requests sent by the client using `GenServer.call(pid, message)`.
    - Typically return `{:reply, reply, new_state}` which sends the `reply` to the client and recursively loops with the `new_state`. 
    - Can return `{:stop, reason, new_state}` which will exit the process with `reason`.
    - Default `use GenServer` implementation returns `{:stop, {:bad_call, msg}, state}` and stops the server. You should implement a `handle_call` function clause for every message your server can handle.
- `handle_cast(message, state)`
    - Invoked to handle **asynchronous** requests sent by the client using `GenServer.cast(pid, message)`.
    - Typically return `{:noreply, new_state}` which recursively loops with the `new_state`.
    - Can return `{:stop, reason, new_state}` which will cause the process to exit with `reason`.
    - Default `use GenServer` implementation returns `{:stop, {:bad_cast, msg}, state}` and stops the server. You should implement a `handle_cast` function for every message your server can handle.
- `handle_info(message, state)`
    - Invoked to handle **all other** requests sent by the client that are not call or cast requests, such as a direct `send` call to the GenServer PID.
    - Default implementation logs the message and returns `{:noreply, state}`.
- `init(args)`
    - Invoked when the server is started.
    - e.g. If you start a server like `GenServer.start(__MODULE__, [], name: @name)` then `init` will be called and passed the second argument of `start`, which is currently `[]`.
    - The default implementation will return `{:ok, args}` where the args parameter is the state used to start the server.
    - If initialization fails (for whatever reason), you can reutrn `{:stop, reason}` which will cause `GenServer.start` to return `{:error, reason}` and cause the process to exit with `reason`.
- `terminate(reason, state)`
    - Invoked when the server is about to terminate. Intended to allow you to do cleanup (like closing resources used by the process).
    - There may be situations where `terminate` is not called, so using Supervisor is more reliable.
    - Default implementation returns `:ok`, ignoring the arguments.
- `code_change(old_version, state, extra)`
    - Feature of the Erlang Virtual Machine is hot code-swapping. When a new version of a module is loaded while the server is running, a migration of the old process state structure may be necessary. This callback is invoked to allow for state migration.
    - Typically you will not need to implement this callback. By default, this function will return the current state:
    ```elixir
    def code_change(_old_version, state, _extra) do
        {:ok, state}
    end
    ```

### Call Timeouts

Invoking `GenServer.call` is synchronous and will wait for 5 seconds by default.
This is overried by passing a timeout value (in milliseconds) as the third argument to call.

```elixir
# wait 2 seconds instead of default 5
GenServer.call @name, :recent_pledges, 2000
```

### Debugging and Tracing

Erlang has a `sys` odule that can be used to inspect the current state of a running GenServer process.

```elixir
iex> {:ok, pid} = Servy.PledgeServer.start()

# get the current state of this process
iex> :sys.get_state(pid)
%Servy.PledgeServer.State{cache_size: 3, pledges: [{"wilma", 15}, {"fred", 25}]}

# Get the full status of a process
iex> :sys.get_status(pid)
{:status, #PID<0.212.0>, {:module, :gen_server},
 [
   [
     "$initial_call": {Servy.PledgeServer, :init, 1},
     "$ancestors": [#PID<0.210.0>, #PID<0.83.0>]
   ],
   :running,
   #PID<0.212.0>,
   [],
   [
     header: 'Status for generic server pledge_server',
     data: [
       {'Status', :running},
       {'Parent', #PID<0.212.0>},
       {'Logged events', []}
     ],
     data: [
       {'State',
        %Servy.PledgeServer.State{
          cache_size: 3,
          pledges: [{"Wilma", 15}, {"Fred", 25}]
        }}
     ]
   ]
 ]}

# turn on tracing for the server process
iex> :sys.trace(pid, true)
:ok

iex> Servy.PledgeServer.create_pledge("moe", 20)
```

Traces can look like the following:

```text
*DBG* pledge_server got call {create_pledge,<<"moe">>,20} from <0.152.0>
*DBG* pledge_server sent <<"pledge-275">> to <0.152.0>, new state #{'__struct__'=>'Elixir.Servy.PledgeServer.State',cache_size=>3,pledges=>[{<<109,111,101>>,20},{<<108,97,114,114,121>>,10},{<<119,105,108,109,97>>,15}]}
```

## Another GenServer

Defined a new GenServer `Servy.SensorServer` that does long polling to periodically fetch images from a mock external API and keeps the results in a cache.
The `handle_info` function is used to trigger off a `:refresh` event every 5 seconds. The refresh event will fetch from the mock external API and store the results into a cache.

Be sure to add a `handle_info` function that is generic after adding the new `:refresh` handler, in order to make your server robust to crashes (a new message of `:boom` will throw a FunctionClauseError because nothing will match with `:boom` otherwise).

## Linking Processes

When an Elixir process terminates, it will notify its linked processes by sending it an exit signal.
If the process terminates normally, the exit signal reason is the atom `:normal`.
Because the process exits normally, the linked process does not terminate.

If the process has an abnormal termination, the exit reason will be anything other than `:normal`. By default, the exit signal indicates that the process terminated abnormally and the linked process will terminate with the same reason *unless* the linked process is trapping exits.

Linked processes are always bidirectional.

### Linking Tasks

Referring back to `Task.async` for spawning functions and `Task.await` for waiting for the results:

```elixir
iex> pid = Task.async(fn -> Servy.Tracker.get_location("bigfoot") end)

iex> Task.await(pid)
%{lat: "29.0469 N", lng: "98.8667 W"}
```

The spawned process is automatically linked to the calling process.
If the spawned task process crashes, then the process that calls `Task.async` will also crash.

```elixir
iex> pid = Task.async(fn -> raise "Kaboom!" end)

** (EXIT from #PID<0.368.0>) evaluator process exited with reason: an exception was raised:
    ** (RuntimeError) Kaboom!
```

## Fault Recovery with OTP Supervisors

Supervisors are special processes that that are hierarchical parents of GenServer processes and other supervisors.
If a GenServer terminates, the Supervisor can restart the GenServer.


### Restart Strategies

One of the options that can be passed into `Supervisor.init` is `strategy`:
* `:one_for_one`: if a child process terminates, only that process is restarted.
* `:one_for_all`: if a child process terminates, all children processes are restarted
* `:rest_for_one`: if a child process terminates, the rest of the child processes (children listed after the terminated child) that were started after it are terminated. All terminated children are then restarted.
* `:simple_one_for_one`: restricted to when a supervisor has one child specification. Used for dynamically spawning child procsses that are then attached to the supervisor (ie a pool of similar worker processes).

Additional options are:

* `:max_restarts`: indicates max number of restarts allowed within a given time frame (default is 3 restarts)
* `:max_seconds`: indicates the time frame for `:max_restarts` (default is 5 seconds)

```elixir
opts = [strategy: :one_for_one, max_restarts: 5, max_seconds: 10]

# These children will be supervised with the one_for_one strategy, allowing 5 restarts within 10 seconds before error occurs.
Supervisor.init(children, opts)
```

## Final OTP Application

An `application` is a first class citizen in Elixir.
See [Application](https://hexdocs.pm/elixir/master/Application.html) for more details.

Application environment configuration can be specified directly in the `mix.exs` file, or by `config/config.exs` files.
  - The `config` directory files are no longer generated by default
  - Configuration settings set in `config` directory are restricted to this project, if the project is a dependency of another application then the contents of `config/config.exs` are never loaded.

Within the application callback module, the `start/2` callback is what is invoked when calling `iex -S mix` or `mix run` and `mix run --no-halt`.

