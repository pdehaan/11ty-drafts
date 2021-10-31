# 11ty-drafts

This example shows how you can use Eleventy's `permalink:false` and `eleventyExcludeFromCollections:true` to conditionally hide contents from your site and/or collections.
It also shows how you can use custom metadata (in this case `draft:true` as a shortcut for setting these two properties) using `eleventyComputed`.

## FILES

1. There are 9 files in our src/posts/ folder
   1. /src/posts/{1-7}.njk &mdash; Our individual post templates.
   2. /src/posts/index.njk &mdash; The index page which lists the non-draft posts.
   3. /src/posts.json &mdash; Our directory data file which sets custom frontmatter data for each of the files in the current folder.
2. We also have a /src/src.11tydata.js directory data file which uses `eleventyComputed` to set some values globally for each file in the /src/ folder (the entire site).
3. Finally in our /.eleventy.js file, we set `eleventyConfig.setDataDeepMerge(true)` so all of the values get merged from the custom files. NOTE: this will be the default behavior in Eleventy v1+.

## POSTS
- /src/posts/1.njk (and /src/posts/3.njk)
    ```njk
    ---
    title: PoSt OnE
    ---
    <h1>{{ title }}</h1>
    ```
    Default behavior. Neither `draft:true` or `eleventyExcludeFromCollections` or `permalink:false` are set.
- /src/posts/2.njk (and /src/posts/4.njk)
    ```njk
    ---
    title: PoSt TwO
    draft: true
    ---
    <h1>{{ title }}</h1>
    ```
    `draft:true` set in frontmatter. This will exclude the files from being generated in the output directory because of the custom rules in our ./src/src.11tydata.js file.
- /src/posts/5.njk
    ```njk
    ---
    title: PoSt FiVe
    draft: false
    ---
    <h1>{{ title }}</h1>
    ```
    `draft:false` is set in frontmatter. This is basically a no-op since the default behavior would be live posts anyways.
- /src/posts/6.njk
    ```njk
    ---
    title: PoSt SiX
    permalink: false
    ---
    <h1>{{ title }}</h1>
    ```
    `permalink:false` is set in frontmatter. Since `permalink:false` is explicitly set, Eleventy would not write the file out to the output directory.
- /src/posts/7.njk
    ```njk
    ---
    title: PoSt SeVeN
    eleventyExcludeFromCollections: true
    ---
    <h1>{{ title }}</h1>
    ```
    `eleventyExcludeFromCollections:true` is set in frontmatter. Since _only_ the `eleventyExcludeFromCollections` is set, the file is still written to the output directory, but it won't be added to the `post` collection (per the /src/posts/posts.json directory data file; see below)
- /src/posts/index.njk
    ```njk
    ---
    title: Posts
    eleventyExcludeFromCollections: true
    ---
    <ul>
    {% for post in collections.post %}
      <li><a href="{{ post.url | url }}">{{ post.data.title }}</a></li>
    {% endfor %}
    </ul>
    ```
    `eleventyExcludeFromCollection:true` is set in frontmatter. This will explictly prevent the index page from being added to the `collections.post` collection. We also loop over the `collections.post` collection and display each page's URL and `title` from the frontmatter.
- /src/posts/posts.json
    ```json
    {
      "tags": ["post"]
    }
    ```
    Sets the `post` tag for each page in the /src/posts/* directory, which will add the page to the `collections.post` collection, unless `eleventyExcludeFromCollections` is set to true.

## DRAFT MODE

Our custom `draft` frontmatter is handled by the /src/src.11tydata.js file:

```js
module.exports = {
  eleventyComputed: {
    permalink(data) {
      // If the page is in `draft:true` mode, don't write it to disk...
      if (data.draft) {
        return false;
      }
      // Return the original value (which could be `false`, or a custom value,
      // or default empty string).
      return data.permalink;
    },
    eleventyExcludeFromCollections(data) {
      // If the page is in `draft:true` mode, or has `permalink:false` exclude
      // it from any collections since it shouldn't be visible anywhere.
      if (data.draft || data.permalink === false) {
        return true;
      }
      return data.eleventyExcludeFromCollections;
    }
  }
};
```

We use `eleventyComputed` to dynamically recalculate the `permalink` and `eleventyExcludeFromCollections` properties for each page in our site (using a root-level directory data file in our "/src/" input directory; as specified in the .eleventy.js config file).

The `permalink` computed data checks to see if the `draft` property exists in our frontmatter, and is truthy (returning `false` if truthy, or the current frontmatter value for `permalink` otherwise).

The `eleventyExcludeFromCollections` computed data checks to see if the `draft` property exists [and is truthy] in our frontmatter, as well as whether the current `permalink` value is `false`. If either of these conditions are truthy we return `true` and the current page/post will be exxcluded from all collections. Otherwise, we return the current value of `eleventyExcludeFromCollections`.

## OUTPUT

We can see that only 5 files get written to our output directory:
- www/posts/{1,3,5,7}/index.html
- www/posts/index.html

```sh
tree -a www
www
└── posts
    ├── 1/index.html
    ├── 3/index.html
    ├── 5/index.html
    ├── 7/index.html
    └── index.html

5 directories, 5 files
```

Interestingly (or not), here's the output of the www/posts/index.html file:

```html
<ul>
  <li><a href="/posts/1/">PoSt OnE</a></li>
  <li><a href="/posts/3/">PoSt ThReE</a></li>
  <li><a href="/posts/5/">PoSt FiVe</a></li>
</ul>
```

We can see that only /post/1/, /post/3/, and /post/5/ are linked (due to /src/posts/7.njk explicitly setting `eleventyExcludeFromCollections:true` in the frontmatter, excluding it from the `collections.post` collection).
