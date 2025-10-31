export const accessOptions = ([
    {value : 1, label : 'Yes'},
    {value : 0, label : 'No'}
])

export const isDynamic = ([
    {value : 0, label : 'Statis'},
    {value : 1, label : 'Dinamis'}
])

export const isAsset = ([
    {value : 'ya', label : 'Yes'},
    {value : 'tidak', label : 'No'},
    {value : 'other', label : 'Other'},
])

export const findAccessOption = (accessValue) => {
    return accessOptions.find(option => option.value === accessValue);
};

export const findisDynamicOption = (accessValue) => {
    return isDynamic.find(option => option.value === accessValue);
};

export const findIsAssetOption = (accessValue) => {
    return isAsset.find(option => option.value === accessValue);
};