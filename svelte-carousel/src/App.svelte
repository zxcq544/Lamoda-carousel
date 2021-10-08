<script>
    import { onMount } from "svelte";
    let translate_to = -400;
    let container_with_images;
    let image_width = 200;
    let transition = 300;
    let is_transitioning = false;
    let disabled = "disabled";

    onMount(function () {
        console.log("container width is ", container_with_images.getBoundingClientRect().width);
        image_width = container_with_images.getBoundingClientRect().width / 2;
        console.log(image_width);

        container_with_images.addEventListener("transitionend", function (ev) {
            if (translate_to == -image_width * 6) {
                transition = 0;
                translate_to = -400;
                // transition = 300;
            }
            if (translate_to == 0) {
                transition = 0;
                translate_to = -800;
            }
            is_transitioning = false;
        });
    });

    function translate_left() {
        is_transitioning = true;
        translate_to -= image_width;
        transition = 300;
    }

    function translate_right() {
        is_transitioning = true;
        translate_to += image_width;
        transition = 300;
    }
</script>

<div class="container">
    <div
        class="visible"
        style="--translate-to:{translate_to}px;transition: {transition}ms;"
        bind:this={container_with_images}
    >
        <img src="./img/TH016CUKFYX5_12905264_10_v1_2x.jpg" alt="" />
        <img src="./img/TH016CUKFYX5_12922545_9_v1_2x.jpg" alt="" />
        <img src="./img/TH016CUKFYX5_12901513_1_v1.jpg" alt="" />
        <img src="./img/TH016CUKFYX5_12901514_2_v1.jpg" alt="" />
        <img src="./img/TH016CUKFYX5_12905264_10_v1_2x.jpg" alt="" />
        <img src="./img/TH016CUKFYX5_12922545_9_v1_2x.jpg" alt="" />
        <img src="./img/TH016CUKFYX5_12901513_1_v1.jpg" alt="" />
        <img src="./img/TH016CUKFYX5_12901514_2_v1.jpg" alt="" />
    </div>
</div>
<button class="left" disabled={is_transitioning ? "disabled" : ""} on:click={translate_left}> left</button>
<button class="right" disabled={is_transitioning ? "disabled" : ""} on:click={translate_right}>right</button>

<style>
    :root {
        --translate-to: 0px;
    }
    .container {
        width: 400px;
        display: flex;
        border: 1px solid black;
        overflow: hidden;
    }
    .visible {
        width: 100%;
        display: flex;
        transform: translateX(var(--translate-to));
    }
    img {
        width: 50%;
    }
</style>
