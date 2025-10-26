<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    let element;

    onMount(() => {
        if (element) {
            dispatch('ready', { element });
        }
    });
</script>

<div bind:this={element} class="editor-container"></div>

<style>
    .editor-container {
        outline: none;
        min-height: 200px;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 6px;
    }

    .editor-container :global(.ProseMirror) {
        outline: none;
        min-height: 200px;
    }

    .editor-container :global(.ProseMirror p) {
        margin: 0.5rem 0;
    }
</style>
