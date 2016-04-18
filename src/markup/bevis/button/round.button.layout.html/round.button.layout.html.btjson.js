module.exports = {
    block: 'maps-button',
    style: 'max-width: {{ state.maxWidth|raw }}px',
    title: '{{ data.title|raw }}',
    icon: {block: 'maps-button-icon'},
    text: '{{ data.content|default:""|raw }}'
};
