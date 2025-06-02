export const accessOptions = ([
    {value : 1, label : 'Yes'},
    {value : 0, label : 'No'}
])

export const findAccessOption = (accessValue) => {
    return accessOptions.find(option => option.value === accessValue);
};