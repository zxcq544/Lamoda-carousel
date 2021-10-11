<script>
    //TODO : Lower points with arrows
    import { onMount } from "svelte";

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
        "./img/TH016CUKFYX5_12922545_9_v1_2x.jpg",
    ];

    onMount(function () {
        // console.log("container width is ", container_with_images.getBoundingClientRect().width);
        image_width = container_with_images.getBoundingClientRect().width / 2;
        translate_to = -image_width * 2;
        // console.log("image_width", image_width);
        // console.log("translate_to", translate_to);
        current = 0;
        // console.log("current ", current);

        container_with_images.addEventListener("transitionend", function (ev) {
            if (translate_to == -image_width * (images_gallery.length + 2)) {
                transition = 0;
                translate_to = -2 * image_width;
            }
            if (translate_to == 0) {
                transition = 0;
                translate_to = -image_width * images_gallery.length;
            }
            is_transitioning = false;
        });
    });

    function translate_right() {
        is_transitioning = true;
        translate_to -= image_width;
        transition = 300;
        if (current == images_gallery.length - 1) {
            current = 0;
        } else {
            current += 1;
        }
        // console.log("current ", current);
    }

    function translate_left() {
        is_transitioning = true;
        translate_to += image_width;
        transition = 300;
        if (current == 0) {
            current = images_gallery.length - 1;
        } else {
            current -= 1;
        }
        // console.log("current ", current);
    }

    function handle_dot_click(i) {
        current = i;
        translate_to = (-current - 2) * image_width;
        transition = 300;
        // console.log("current ", current);
        // console.log("i ", i);
    }
</script>

<div class="carousel">
    <button class="left" disabled={is_transitioning ? "disabled" : ""} on:click={translate_left} />
    <div class="container">
        <div
            class="visible"
            style="--translate-to:{translate_to}px;transition: {transition}ms;"
            bind:this={container_with_images}
        >
            <img src={images_gallery[images_gallery.length - 2]} alt="" />
            <img src={images_gallery[images_gallery.length - 1]} alt="" />
            {#each images_gallery as image_src}
                <img src={image_src} alt="" />
            {/each}
            <img src={images_gallery[0]} alt="" />
            <img src={images_gallery[1]} alt="" />
        </div>
    </div>
    <button class="right" disabled={is_transitioning ? "disabled" : ""} on:click={translate_right} />
    <div class="dots">
        <button class="dots__left-arrow" disabled={is_transitioning ? "disabled" : ""} on:click={translate_left} />
        {#each images_gallery as image_src, i}
            <div class="dots__dot-container" on:click={() => handle_dot_click(i)}>
                <div class={i == current ? "dots__dot-container__dot" : "dots__dot-container__dot-small"} />
            </div>
        {/each}

        <button class="dots__right-arrow" disabled={is_transitioning ? "disabled" : ""} on:click={translate_right} />
    </div>
</div>

<style>
    .dots__dot-container__dot-small {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: black;
        opacity: 0.4;
    }
    .dots__dot-container:hover .dots__dot-container__dot-small {
        width: 8px;
        height: 8px;
        /* border-radius: 50%; */
        /* background-color: black; */
        opacity: 1;
    }
    .dots__dot-container {
        cursor: pointer;
        min-width: 18px;
        display: flex;
        height: 40px;
        align-content: center;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
    }
    .dots__dot-container__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: black;
    }
    .dots {
        position: absolute;
        display: flex;
        align-content: center;
        justify-content: center;
        align-items: center;
        width: auto;
        height: 40px;
        background-color: hsla(0, 0%, 100%, 0.4);
        bottom: 0;
        border-top-left-radius: 3px;
        border-top-right-radius: 3px;
    }
    .dots__left-arrow,
    .dots__right-arrow {
        height: 100%;
        border: 0;
        width: 40px;
        cursor: pointer;
        background-color: transparent;
        opacity: 0.4;
        transition: opacity 300ms ease-out;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 3;
        display: flex;
    }
    .dots__left-arrow {
        background-image: url("../img/arrow.svg");
    }
    .dots__right-arrow {
        background-image: url("../img/arrow.svg");
        transform: rotate(180deg);
    }
    .carousel {
        display: inline-flex;
        position: relative;
        align-items: center;
        justify-content: center;
    }
    :root {
        --translate-to: 0px;
    }
    .container {
        width: 800px;
        display: flex;
        /* border: 1px solid black; */
        overflow: hidden;
        justify-content: space-between;
        align-items: center;
    }
    .visible {
        width: 100%;
        display: flex;
        /* position: absolute; */
        transform: translateX(var(--translate-to));
    }
    img {
        width: 50%;
    }
    .left,
    .right {
        position: absolute;
        height: 100%;
        border: 0;
        width: 50px;
        cursor: pointer;
        background-color: transparent;
        opacity: 0.4;
        transition: opacity 300ms ease-out;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 3;
    }
    .left {
        background-image: url("../img/arrow.svg");
        left: 0;
    }

    .left:hover,
    .right:hover,
    .dots__left-arrow:hover,
    .dots__right-arrow:hover {
        opacity: 1;
        transition: opacity 200ms ease-in;
    }

    .right {
        background-image: url("../img/arrow.svg");
        transform: rotate(180deg);
        right: 0;
    }
</style>
