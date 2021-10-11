
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.43.1 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (82:12) {#each images_gallery as image_src}
    function create_each_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*image_src*/ ctx[12])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-dxroxm");
    			add_location(img, file, 82, 16, 2707);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(82:12) {#each images_gallery as image_src}",
    		ctx
    	});

    	return block;
    }

    // (96:8) {#each images_gallery as image_src, i}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*i*/ ctx[14]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*i*/ ctx[14] == /*current*/ ctx[4]
    			? "dots-container__dot-container__dot"
    			: "dots-container__dot-container__dot-small") + " svelte-dxroxm"));

    			add_location(div0, file, 97, 16, 3347);
    			attr_dev(div1, "class", "dots-container__dot-container svelte-dxroxm");
    			add_location(div1, file, 96, 12, 3250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*current*/ 16 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*i*/ ctx[14] == /*current*/ ctx[4]
    			? "dots-container__dot-container__dot"
    			: "dots-container__dot-container__dot-small") + " svelte-dxroxm"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(96:8) {#each images_gallery as image_src, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div3;
    	let button0;
    	let button0_disabled_value;
    	let t0;
    	let div1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let t3;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let img3;
    	let img3_src_value;
    	let t5;
    	let button1;
    	let button1_disabled_value;
    	let t6;
    	let div2;
    	let button2;
    	let button2_disabled_value;
    	let t7;
    	let t8;
    	let button3;
    	let button3_disabled_value;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*images_gallery*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*images_gallery*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			button0 = element("button");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t1 = space();
    			img1 = element("img");
    			t2 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			img2 = element("img");
    			t4 = space();
    			img3 = element("img");
    			t5 = space();
    			button1 = element("button");
    			t6 = space();
    			div2 = element("div");
    			button2 = element("button");
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			button3 = element("button");
    			attr_dev(button0, "class", "left svelte-dxroxm");
    			button0.disabled = button0_disabled_value = /*is_transitioning*/ ctx[2] ? "disabled" : "";
    			add_location(button0, file, 72, 4, 2192);
    			if (!src_url_equal(img0.src, img0_src_value = /*images_gallery*/ ctx[5][/*images_gallery*/ ctx[5].length - 2])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-dxroxm");
    			add_location(img0, file, 79, 12, 2505);
    			if (!src_url_equal(img1.src, img1_src_value = /*images_gallery*/ ctx[5][/*images_gallery*/ ctx[5].length - 1])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-dxroxm");
    			add_location(img1, file, 80, 12, 2580);
    			if (!src_url_equal(img2.src, img2_src_value = /*images_gallery*/ ctx[5][0])) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "svelte-dxroxm");
    			add_location(img2, file, 84, 12, 2770);
    			if (!src_url_equal(img3.src, img3_src_value = /*images_gallery*/ ctx[5][1])) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			attr_dev(img3, "class", "svelte-dxroxm");
    			add_location(img3, file, 85, 12, 2821);
    			attr_dev(div0, "class", "visible svelte-dxroxm");
    			set_style(div0, "--translate-to", /*translate_to*/ ctx[3] + "px");
    			set_style(div0, "transition", /*transition*/ ctx[1] + "ms");
    			add_location(div0, file, 74, 8, 2324);
    			attr_dev(div1, "class", "container svelte-dxroxm");
    			add_location(div1, file, 73, 4, 2292);
    			attr_dev(button1, "class", "right svelte-dxroxm");
    			button1.disabled = button1_disabled_value = /*is_transitioning*/ ctx[2] ? "disabled" : "";
    			add_location(button1, file, 88, 4, 2890);
    			attr_dev(button2, "class", "dots-container__left-arrow svelte-dxroxm");
    			button2.disabled = button2_disabled_value = /*is_transitioning*/ ctx[2] ? "disabled" : "";
    			add_location(button2, file, 90, 8, 3029);
    			attr_dev(button3, "class", "dots-container__right-arrow svelte-dxroxm");
    			button3.disabled = button3_disabled_value = /*is_transitioning*/ ctx[2] ? "disabled" : "";
    			add_location(button3, file, 105, 8, 3588);
    			attr_dev(div2, "class", "dots-container svelte-dxroxm");
    			add_location(div2, file, 89, 4, 2992);
    			attr_dev(div3, "class", "carousel svelte-dxroxm");
    			add_location(div3, file, 71, 0, 2165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, button0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t1);
    			append_dev(div0, img1);
    			append_dev(div0, t2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div0, t3);
    			append_dev(div0, img2);
    			append_dev(div0, t4);
    			append_dev(div0, img3);
    			/*div0_binding*/ ctx[9](div0);
    			append_dev(div3, t5);
    			append_dev(div3, button1);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, button2);
    			append_dev(div2, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t8);
    			append_dev(div2, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*translate_left*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", /*translate_right*/ ctx[6], false, false, false),
    					listen_dev(button2, "click", /*translate_left*/ ctx[7], false, false, false),
    					listen_dev(button3, "click", /*translate_right*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*is_transitioning*/ 4 && button0_disabled_value !== (button0_disabled_value = /*is_transitioning*/ ctx[2] ? "disabled" : "")) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (dirty & /*images_gallery*/ 32) {
    				each_value_1 = /*images_gallery*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, t3);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*translate_to*/ 8) {
    				set_style(div0, "--translate-to", /*translate_to*/ ctx[3] + "px");
    			}

    			if (dirty & /*transition*/ 2) {
    				set_style(div0, "transition", /*transition*/ ctx[1] + "ms");
    			}

    			if (dirty & /*is_transitioning*/ 4 && button1_disabled_value !== (button1_disabled_value = /*is_transitioning*/ ctx[2] ? "disabled" : "")) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}

    			if (dirty & /*is_transitioning*/ 4 && button2_disabled_value !== (button2_disabled_value = /*is_transitioning*/ ctx[2] ? "disabled" : "")) {
    				prop_dev(button2, "disabled", button2_disabled_value);
    			}

    			if (dirty & /*handle_dot_click, current*/ 272) {
    				each_value = /*images_gallery*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, t8);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*is_transitioning*/ 4 && button3_disabled_value !== (button3_disabled_value = /*is_transitioning*/ ctx[2] ? "disabled" : "")) {
    				prop_dev(button3, "disabled", button3_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_1, detaching);
    			/*div0_binding*/ ctx[9](null);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let container_with_images;
    	let image_width;
    	let transition = 0;
    	let is_transitioning = false;
    	let translate_to;
    	let current;

    	let images_gallery = [
    		"./img/TH016CUKFYX5_12901513_1_v1.jpg",
    		"./img/TH016CUKFYX5_12901514_2_v1.jpg",
    		"./img/TH016CUKFYX5_12905264_10_v1_2x.jpg",
    		"./img/TH016CUKFYX5_12922545_9_v1_2x.jpg"
    	];

    	onMount(function () {
    		// console.log("container width is ", container_with_images.getBoundingClientRect().width);
    		image_width = container_with_images.getBoundingClientRect().width / 2;

    		$$invalidate(3, translate_to = -image_width * 2);

    		// console.log("image_width", image_width);
    		// console.log("translate_to", translate_to);
    		$$invalidate(4, current = 0);

    		// console.log("current ", current);
    		container_with_images.addEventListener("transitionend", function (ev) {
    			if (translate_to == -image_width * (images_gallery.length + 2)) {
    				$$invalidate(1, transition = 0);
    				$$invalidate(3, translate_to = -2 * image_width);
    			}

    			if (translate_to == 0) {
    				$$invalidate(1, transition = 0);
    				$$invalidate(3, translate_to = -image_width * images_gallery.length);
    			}

    			$$invalidate(2, is_transitioning = false);
    		});
    	});

    	function translate_right() {
    		$$invalidate(2, is_transitioning = true);
    		$$invalidate(3, translate_to -= image_width);
    		$$invalidate(1, transition = 300);

    		if (current == images_gallery.length - 1) {
    			$$invalidate(4, current = 0);
    		} else {
    			$$invalidate(4, current += 1);
    		}
    	} // console.log("current ", current);

    	function translate_left() {
    		$$invalidate(2, is_transitioning = true);
    		$$invalidate(3, translate_to += image_width);
    		$$invalidate(1, transition = 300);

    		if (current == 0) {
    			$$invalidate(4, current = images_gallery.length - 1);
    		} else {
    			$$invalidate(4, current -= 1);
    		}
    	} // console.log("current ", current);

    	function handle_dot_click(i) {
    		$$invalidate(4, current = i);
    		$$invalidate(3, translate_to = (-current - 2) * image_width);
    		$$invalidate(1, transition = 300);
    	} // console.log("current ", current);
    	// console.log("i ", i);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container_with_images = $$value;
    			$$invalidate(0, container_with_images);
    		});
    	}

    	const click_handler = i => handle_dot_click(i);

    	$$self.$capture_state = () => ({
    		onMount,
    		container_with_images,
    		image_width,
    		transition,
    		is_transitioning,
    		translate_to,
    		current,
    		images_gallery,
    		translate_right,
    		translate_left,
    		handle_dot_click
    	});

    	$$self.$inject_state = $$props => {
    		if ('container_with_images' in $$props) $$invalidate(0, container_with_images = $$props.container_with_images);
    		if ('image_width' in $$props) image_width = $$props.image_width;
    		if ('transition' in $$props) $$invalidate(1, transition = $$props.transition);
    		if ('is_transitioning' in $$props) $$invalidate(2, is_transitioning = $$props.is_transitioning);
    		if ('translate_to' in $$props) $$invalidate(3, translate_to = $$props.translate_to);
    		if ('current' in $$props) $$invalidate(4, current = $$props.current);
    		if ('images_gallery' in $$props) $$invalidate(5, images_gallery = $$props.images_gallery);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		container_with_images,
    		transition,
    		is_transitioning,
    		translate_to,
    		current,
    		images_gallery,
    		translate_right,
    		translate_left,
    		handle_dot_click,
    		div0_binding,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,

    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
