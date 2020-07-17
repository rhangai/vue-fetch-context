import VueImported from "vue";

export type Vue = VueImported;
export {
	VueConstructor,
	ComponentOptions as VueComponentOptions,
	CreateElement as VueCreateElement,
	PluginObject as VuePlugin,
} from "vue";
