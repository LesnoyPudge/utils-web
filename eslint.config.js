import { config } from '@lesnoypudge/eslint-config';



export default config.createConfig(
    config.configs.base,
    config.configs.web,
    {
        rules: {
            'unicorn/prefer-global-this': 'off',
        },
    },
    config.configs.disableTypeChecked,
);