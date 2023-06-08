# react-firebase-pagination

A React Hook that makes it easy to paginate Firestore collections.
This hook provides _cumulative_ pagination and maintains references to previous documents, so it might not be suitable for large document sets.

## Support for Firebase 9

support for Firebase 9 and are backwards _incompatible_ with previous versions of Firebase.

## Install

```
npm install react-firebase-pagination
```

OR

```
yarn add react-firebase-pagination
```

### Options

| **prop**   | **Type**  | **Default** | **description**                                                                    | **Required** |
| ---------- | --------- | ----------- | ---------------------------------------------------------------------------------- | ------------ |
| query      | `Query`   | null        | The query of your Firebase database. e.g. `query(collection(db, '[collection]'))`. | ✔            |
| pageSize   | `Number`  | 10          | The number of items per page.                                                      |              |
| pageByPage | `Boolean` | false       | Load data page by page or in a single page by adding more data.                    |              |

### State

| **prop**    | **value**  | **description**                                                           |
| ----------- | ---------- | ------------------------------------------------------------------------- |
| loading     | `Boolean`  | Is true when a page is loading.                                           |
| data        | `Object`   | Data object with the current page, total page, total docs, and docs array |
| getNext     | `Function` | W'll render the next page when called. Take no arguments.                 |
| getPrevious | `Function` | W'll render the previous page when called. Take no arguments.             |
| hasNext     | `Boolean`  | It's true when a previous page has data.                                  |
| hasPrevious | `Boolean`  | It's true when the next page has data.                                    |

## Example Use

This is an example of a [Firestore](https://firebase.google.com/docs/firestore/).

You can also change query during runtime. Hook will detect new query and start pagination from the beginning.
Here is an example of controlling query's `orderDirection` by React's state:

```jsx
import usePaginate from 'react-firebase-pagination';

const mainQuery = query(collection(db, '[collection]'), orderBy('created_timestamp', 'desc'));

const App = () => {
  const { getNext, getPrevious, data, loading } = usePaginate({
    pageSize: 10,
    pageByPage: true,
    query: mainQuery,
  })

  if (loading) {
    return <LoadingComponent />
  }

  ...
}
```
