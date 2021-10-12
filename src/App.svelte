<script>
    import Carousel from "./Carousel.svelte";
    let images = [
        "./img/TH016CUKFYX5_12901513_1_v1.jpg",
        "./img/TH016CUKFYX5_12901514_2_v1.jpg",
        "./img/TH016CUKFYX5_12905264_10_v1_2x.jpg",
        "./img/TH016CUKFYX5_12922545_9_v1_2x.jpg",
    ];
    let width = 800;
</script>

<Carousel images_gallery={images} container_width_in_px={width} />
