const PageSize = 10;
module.exports.paginate = async (posts, PageNumber) => {
  const startIndex = (PageNumber - 1) * PageSize;
  const endIndex = PageSize * PageNumber;

  if (endIndex < posts.length) {
    PageNumber = PageNumber + 1;
  }
  const data = posts.slice(startIndex, endIndex);

  return data;
};
