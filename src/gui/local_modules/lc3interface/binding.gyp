{
    'targets': [
        {
            'include_dirs': [
                "<!(node -e \"require('nan')\")",
                '<(module_root_dir)/../../../backend'
            ],
            'target_name': 'lc3interface',
            'sources': ['wrapper.cpp'],
            'cflags_cc': ['-std=c++20'],
            'conditions': [
                ['OS=="mac"', {
                    'xcode_settings': {
                        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                        'CLANG_CXX_LANGUAGE_STANDARD': 'c++20'
                    }
                }],
                ['OS=="mac" or OS=="linux"', {
                    'link_settings': {
                        'libraries': ['<(module_root_dir)/../../../../build/lib/liblc3core.a']
                    },
                    'cflags!': ['-fno-exceptions'],
                    'cflags_cc!': ['-fno-exceptions'],
                }],
                ['OS=="win"', {
                    'msvs_settings': {
                        'VCCLCompilerTool': {
                            'ExceptionHandling': '2',
                            'AdditionalOptions': ['/std:c++20']
                        }
                    },
                    'link_settings': {
                        'libraries': ['<(module_root_dir)/../../../../build/lib/Release/lc3core']
                    }
                }]
            ]
        }
    ]
}
