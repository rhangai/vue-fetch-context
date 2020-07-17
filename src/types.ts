import VueImported from "vue";

export type Vue = VueImported;
export {
	VueConstructor,
	PropOptions as VuePropOptions,
	ComponentOptions as VueComponentOptions,
	CreateElement as VueCreateElement,
	PluginObject as VuePlugin,
	WatchOptions as VueWatchOptions,
} from "vue";
