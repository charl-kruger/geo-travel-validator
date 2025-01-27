import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'umd',
            name: 'Fingerprint',
        },
        {
            file: 'dist/index.esm.js',
            format: 'es',
        },
    ],
    plugins: [typescript()],
};