import React, { useState, useEffect } from 'react';
import { Container, FormControl, InputLabel, MenuItem, Select, Pagination,Typography } from '@mui/material';
import SearchBar from './SearchMySpaces';
import MySpaceItem from '../../components/mySpaceItem/mySpaceItem';
import Navbar from '../../components/navbar/Navbar';
import OfficeStore from '../../api/OfficeStore';
import { createTheme, ThemeProvider } from '@mui/material/styles';
const MySpaces = () => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [officeSpaces, setOfficeSpaces] = useState(OfficeStore.getState().offices);
  const [filteredOfficeSpaces, setFilteredOfficeSpaces] = useState(OfficeStore.getState().offices);
  const [sortOption, setSortOption] = useState('default');
  const listRef = React.createRef();

  useEffect(() => {
    OfficeStore.getState()
        .fetchOffices(1000, 0)
        .then(response => response.json())
        .then(response => {
          console.log(response);
          const totalItems = response.length;
          setTotalPages(Math.ceil(totalItems / itemsPerPage));
          OfficeStore.getState().setOffices(response);
          setOfficeSpaces(response);
          setFilteredOfficeSpaces(response);
        })
        .catch(error => console.error(error));
  }, []);

  const handleOfficeUpdate = async () => {
    try {
      const response = await OfficeStore.getState().fetchOffices(1000, 0);
      const data = await response.json();
      
      OfficeStore.getState().setOffices(data);
      setOfficeSpaces(data);
      setFilteredOfficeSpaces(data);
    } catch (error) {
      console.error("Error updating offices:", error);
    }
  };

  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const slicedSpaces = officeSpaces.slice(start, end);
    setFilteredOfficeSpaces(slicedSpaces);
  }, [currentPage, officeSpaces]);

  const handleSearch = (searchTerm) => {
    const filteredSpaces = officeSpaces.filter(space =>
        space.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredOfficeSpaces(filteredSpaces);
  };

  const handleSortChange = (event) => {
    const selectedSortOption = event.target.value;
    setSortOption(selectedSortOption);

    let sortedSpaces;
    switch (selectedSortOption) {
      case 'alphabetical':
        sortedSpaces = [...filteredOfficeSpaces].sort((a, b) =>
            a.location.localeCompare(b.location)
        );
        break;
      case 'price':
        sortedSpaces = [...filteredOfficeSpaces].sort((a, b) =>
            parseFloat(a.price) - parseFloat(b.price)
        );
        break;
      default:
        sortedSpaces = [...officeSpaces];
        break;
    }

    setFilteredOfficeSpaces(sortedSpaces);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const defaultTheme = createTheme({
    palette: {
      primary: {
        main: '#000000',
      },
    },
    typography: {
      fontFamily: 'Dubai Medium',
    },
  });

  return (
      <div data-testid="mySpacesPage-1">
        <ThemeProvider theme={defaultTheme}>
          <Navbar />
          <Typography variant="h5" gutterBottom sx={{ fontSize: '30px',marginLeft:'25px',marginTop:'30px' }}>
            Your Rented Spaces
          </Typography>
          <Container ref={listRef}>
            <SearchBar onSearchHistory={handleSearch} />
            <FormControl style={{ margin: '20px 0' }}>
              <InputLabel htmlFor="sort">Sort by:</InputLabel>
              <Select id="sort" value={sortOption} onChange={handleSortChange} label="Sort by">
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="alphabetical">Alphabetical</MenuItem>
                <MenuItem value="price">Price</MenuItem>
              </Select>
            </FormControl>
            <div className="listContainerMySpace">
                <div className="listWrapperMySpace">
                  <div className="listResultMySpace">
                    {filteredOfficeSpaces.map(space => (
                        <MySpaceItem key={space.id} space={space} onUpdate={handleOfficeUpdate}/>
                    ))}
                  </div>
                  <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        paddingTop: '20px', // Adjust as needed
                        marginBottom: '30px'
                      }}
                  >
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                    />
                    <div style={{marginLeft: '20px'}}>Page {currentPage} of {totalPages}</div>
                  </div>
                </div>
            </div>
          </Container>

        </ThemeProvider>
        
      </div>
);
};

export default MySpaces;