---
title: "Theme Reference"
date: 2020-09-29T10:35:42-06:00
draft: false
description: A reference document for markdown to theme rendering verification.
status: in-progress
tags:
  - personal
---

Refer to the [John Gruber Daring Fireball document](https://daringfireball.net/projects/markdown/basics), [Github Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet), and [current CommonMark specification](https://spec.commonmark.org/current/) for more details.

# Headers
These are [ATX-Style headers](http://www.aaronsw.com/2002/atx/intro), level 1.

## H2
Content at level 2.

### H3
Content at level 3.

#### H4
Content at level 4.

##### H5
Content at level 5.

###### H6
Content at level 6.

Alternatively, for H1 and H2, an underline-ish style:

Alternate H1 Header
===================
These are [Setext](https://en.wikipedia.org/wiki/Setext) style headers. Level 1.

Alt-H2
------
Setext style headers only support H1 and H2.


```markdown
# Headers
These are [ATX-Style headers](http://www.aaronsw.com/2002/atx/intro), level 1.

## H2
Content at level 2.

### H3
Content at level 3.

#### H4
Content at level 4.

##### H5
Content at level 5.

###### H6
Content at level 6.

Alternatively, for H1 and H2, an underline-ish style:

Alternate H1 Header
===================
These are [Setext](https://en.wikipedia.org/wiki/Setext) style headers. Level 1.

Alt-H2
------
Setext style headers only support H1 and H2.
```

# Phrase Emphasis

Emphasis, aka italics, with *asterisks* or _underscores_.

Strong emphasis, aka bold, with **asterisks** or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~

```markdown
Emphasis, aka italics, with *asterisks* or _underscores_.

Strong emphasis, aka bold, with **asterisks** or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~
```

---
# Lists

## Unordered Lists

*   Candy.
*   Gum.
*   Booze.

+   Candy.
+   Gum.
+   Booze.

-   Candy.
-   Gum.
-   Booze.

```markdown
*   Candy.
*   Gum.
*   Booze.

+   Candy.
+   Gum.
+   Booze.

-   Candy.
-   Gum.
-   Booze.
```

## Ordered Lists

1. Red
2. Blue
3. Green

```markdown
1. Red
2. Blue
3. Green
```

## Multi-Paragraph

*   A list item.

    With multiple paragraphs.

*   Another item in the list.

```markdown
*   A list item.

    With multiple paragraphs.

*   Another item in the list.
```

## Nested Lists

* Root
  * Child
    * Leaf
  * Leaf

```markdown
* Root
  * Child
    * Leaf
  * Leaf
```

---
# Links

## Inline

This is an [example link](http://example.com/).

```markdown
This is an [example link](http://example.com/).
```

## Reference

I get 10 times more traffic from [Google][1] than from
[Yahoo][2] or [MSN][3].

[1]: http://google.com/        "Google"
[2]: http://search.yahoo.com/  "Yahoo Search"
[3]: http://search.msn.com/    "MSN Search"

```markdown
I get 10 times more traffic from [Google][1] than from
[Yahoo][2] or [MSN][3].

[1]: http://google.com/        "Google"
[2]: http://search.yahoo.com/  "Yahoo Search"
[3]: http://search.msn.com/    "MSN Search"
```

---
# Images

## Inline
![UDIA 64x64](https://media.udia.ca/logo/logo-64x64.png "UDIA") ![UDIA Inverse 64x64](https://media.udia.ca/logo/logo-inverse-64x64.png "UDIA")

```markdown
![UDIA 64x64](https://media.udia.ca/logo/logo-64x64.png "UDIA") ![UDIA Inverse 64x64](https://media.udia.ca/logo/logo-inverse-64x64.png "UDIA")
```

## Reference
![UDIA Inverse 64x64][udia-inverse-64] ![UDIA 64x64][udia-64]

[udia-inverse-64]: https://media.udia.ca/logo/logo-inverse-64x64.png "UDIA"
[udia-64]: https://media.udia.ca/logo/logo-64x64.png "UDIA"

```markdown
![UDIA Inverse 64x64][udia-inverse-64]
![UDIA 64x64][udia-64]

[udia-inverse-64]: https://media.udia.ca/logo/logo-inverse-64x64.png "UDIA"
[udia-64]: https://media.udia.ca/logo/logo-64x64.png "UDIA"
```

---
# Code
I strongly recommend against using any `<blink>` tags.

I wish SmartyPants used named entities like `&mdash;`
instead of decimal-encoded entites like `&#8212;`.

If you want your page to validate under XHTML 1.0 Strict,
you've got to put paragraph tags in your blockquotes:

    <blockquote>
        <p>For example.</p>
    </blockquote>

```bash
echo "Hello world!";
```

Code tags are very neat!

This is a very long code tag.\
`v^j*oHq!jJ#pQ^#*#ATGnu6y9j8AvL5tJofLQL6XRmKDenWna&VpR5^!mC$dG9FJHuxhVcFnV!bpu&hdGF!2tS8YGwRQkiBSP2My`

This is a long code tag with spaces.\
`alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'`

```markdown
I strongly recommend against using any `<blink>` tags.

I wish SmartyPants used named entities like `&mdash;`
instead of decimal-encoded entites like `&#8212;`.

If you want your page to validate under XHTML 1.0 Strict,
you've got to put paragraph tags in your blockquotes:

    <blockquote>
        <p>For example.</p>
    </blockquote>

```
    ```bash
    echo "Hello world!";
    ```
```markdown
Code tags are very neat!

This is a very long code tag.\
`v^j*oHq!jJ#pQ^#*#ATGnu6y9j8AvL5tJofLQL6XRmKDenWna&VpR5^!mC$dG9FJHuxhVcFnV!bpu&hdGF!2tS8YGwRQkiBSP2My`

This is a long code tag with spaces.\
`alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'`
```

---
# Tables

Colons can be used to align columns.

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

There must be at least 3 dashes separating each header cell.
The outer pipes (|) are optional, and you don't need to make the 
raw Markdown line up prettily. You can also use inline Markdown.

Markdown | Less | Pretty
--- | --- | ---
*Still* | `renders` | **nicely**
1 | 2 | 3

Showcasing the width overflow functionality (for mobile devices).

| Longer | Tables | Still | Overflow | Nicely! | Have    | Some  | Useful | Music | Mnemonics |
|--------|--------|-------|----------|---------|---------|-------|--------|-------|-----------|
| Every  | Good   | Boy   | Deserves  | Fruit  | Grizzly | Bears | Don't  | Fly   | Airplanes |

```markdown
Colons can be used to align columns.

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

There must be at least 3 dashes separating each header cell.
The outer pipes (|) are optional, and you don't need to make the 
raw Markdown line up prettily. You can also use inline Markdown.

Markdown | Less | Pretty
--- | --- | ---
*Still* | `renders` | **nicely**
1 | 2 | 3

Showcasing the width overflow functionality (for mobile devices).

| Longer | Tables | Still | Overflow | Nicely! | Have    | Some  | Useful | Music | Mnemonics |
|--------|--------|-------|----------|---------|---------|-------|--------|-------|-----------|
| Every  | Good   | Boy   | Deserves  | Fruit  | Grizzly | Bears | Don't  | Fly   | Airplanes |

```

---
# Blockquotes

> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote. 

```markdown
> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote. 
```

# MathJax

## Inline

The pythagorean theorm, {% mathjax %}a^2 + b^2 = c^2{% endmathjax %}, is an
equation about the three sides of a right triangle.

A long inline function {% mathjax %}1 * 2 * 3 * 4 * 5 * 6 * 7 * 8 * 9 * 10 * 11 * 12 * 13 * 14 * 15 = 15! = 1307674368000{% endmathjax %}

```markdown
The pythagorean theorm, {% mathjax %}a^2 + b^2 = c^2{% endmathjax %}, is an
equation about the three sides of a right triangle.
```

## Block

The following function:
{% mathjax '{ "conversion": { "display": true } }' %}x = {-b \pm \sqrt{b^2-4ac} \over 2a}{% endmathjax %}
can be used to calculate the two roots of a trinomial function:
{% mathjax '{ "conversion": { "display": true } }' %}ax^2 + bx + c = 0{% endmathjax %} So neat!

Some long block function:
{% mathjax '{ "conversion": { "display": true } }' %}F = \{F_{x} \in  F_{c} : (|S| > |C|) \cap 
(minPixels  < |S| < maxPixels) \cap 
(|S_{connected}| > |S| - \epsilon)
  \}{% endmathjax %}

```text
The following function:
{% mathjax '{ "conversion": { "display": true } }' %}x = {-b \pm \sqrt{b^2-4ac} \over 2a}{% endmathjax %}
can be used to calculate the two roots of a trinomial function:
{% mathjax '{ "conversion": { "display": true } }' %}ax^2 + bx + c = 0{% endmathjax %} So neat!

Some long block function:
{% mathjax '{ "conversion": { "display": true } }' %}F = \{F_{x} \in  F_{c} : (|S| > |C|) \cap 
(minPixels  < |S| < maxPixels) \cap 
(|S_{connected}| > |S| - \epsilon)
  \}{% endmathjax %}
```
