# @rhangai/vue-fetch-context

Library to fetch arbitrary data on components according to its context

## Getting started

```sh
yarn add @rhangai/vue-fetch-context rxjs
```

Create your fetcher structure

```ts
import {
	FetchResult,
	createFetchContextMixins,
} from "@rhangai/vue-fetch-context";

export interface User {
	name: string;
}

export interface IFetcher {
	user(): FetcherResult<User>;
}

export const FetchContextMixins = createFetchContextMixins<IFetcher>(Vue);
```

Use on your components

```ts
import { FetchContextMixins } from "...";

export default Vue.extend({
	name: "Userinfo",
	mixins: [
		FetchContextMixins.Data({
			fetch: ({ fetcher }) => fetcher.user(),
		}),
	],
	template: `
		<div>
			{{state.data.name}}
		</div>
	`,
});
```

Then, implement the fetcher and use it in the context

```ts
import { of } from "rxjs";
import { IFetcher } from "..";

class Fetcher implements IFetcher {
	user() {
		return of({ name: "John doe" });
	}
}

export default Vue.extend({
	components: {
		Userinfo,
	},
	data: () => ({
		fetcher: new Fetcher(),
	}),
	template: `
		<fetch-context :fetcher="fetcher">
			<userinfo />
		</fetch-context>
	`,
});
```
