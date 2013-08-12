describe("Searching for services on the transaction explorer. ", function () {
    describe("The search form", function () {
        
        var fakeSearch = undefined,
            ENTER_KEY = 13;

        beforeEach(function () {
            $('<input id="search-box" type="text"></input>').appendTo('body');
            $('<button id="search-button" type="submit">Find</button>').appendTo('body');
            fakeSearch = {
                load: jasmine.createSpy('load search data'),
                performSearch: jasmine.createSpy('perform a search')
            };
            GOVUK.transactionsExplorer.wireSearchForm(
                { inputId: "#search-box", buttonId: "#search-button" },
                fakeSearch
            );
        });

        afterEach(function () {
            $('#search-box').remove();
            $('#search-button').remove();
        });

        it("should load search data the first time the search box gets focus", function () {
            $('#search-box').trigger($.Event('focus'));
            expect(fakeSearch.load).toHaveBeenCalled();
        });

        it("should not try to load the search data multiple times", function () {
            $('#search-box').trigger($.Event('focus'));
            $('#search-box').trigger($.Event('focus'));
            expect(fakeSearch.load.calls.length).toBe(1);
        });

        it("should perform a search when enter is pressed", function () {
            $('#search-box').val('woozle wozzle');
            $('#search-box').trigger($.Event('keydown', { keyCode: ENTER_KEY }));
            expect(fakeSearch.performSearch).toHaveBeenCalledWith('woozle wozzle');
        });

        it("should perform a search when the search button is clicked", function () {
            $('#search-box').val('woozle wozzle weazle');
            $('#search-button').click();
            expect(fakeSearch.performSearch).toHaveBeenCalledWith('woozle wozzle weazle');
        });
    });

    describe("Result ranking", function () {
        describe("score:", function () {
            it('should score a search result with the number of transactions if the service contains the search term', function () {
                var score = GOVUK.transactionsExplorer.scoreService(
                    'wibble',
                    {
                        agencyOrBodyAbbreviation: "DOW",
                        service: "Request to wibble",
                        departmentAbbreviation: "DOW",
                        agencyOrBody: "",
                        transactionsPerYear: 4500,
                        department: "Department of Wibble"
                    }
                );

                expect(score).toBe(4500);
            });

            it('should return a score of 0 if the service does not match the search term', function () {
                var score = GOVUK.transactionsExplorer.scoreService(
                    'mongoose',
                    {
                        agencyOrBodyAbbreviation: "DOW",
                        service: "Request to wibble",
                        departmentAbbreviation: "DOW",
                        agencyOrBody: "",
                        transactionsPerYear: 4500,
                        department: "Department of Wibble"
                    }
                );

                expect(score).toBe(0);
            });

            it('should return a score of 1 if the service matches the search term but does not have any transactions', function () {
                var score = GOVUK.transactionsExplorer.scoreService(
                    'Ninjas',
                    {
                        agencyOrBodyAbbreviation: "DON",
                        service: "Dial a ninja",
                        departmentAbbreviation: "DON",
                        agencyOrBody: "",
                        transactionsPerYear: null,
                        department: "Department of Ninjas"
                    }
                );

                expect(score).toBe(1);
            });

            it('should ignore case when ranking results', function () {
                var score = GOVUK.transactionsExplorer.scoreService(
                    'NINJAS',
                    {
                        agencyOrBodyAbbreviation: "DON",
                        service: "Dial a ninja",
                        departmentAbbreviation: "DON",
                        agencyOrBody: "",
                        transactionsPerYear: 7777,
                        department: "Department of Ninjas"
                    }
                );

                expect(score).toBe(7777);
            });
        });
    });

    describe("Search", function () {
        var fakeAjax = undefined;

        beforeEach(function () {
            fakeAjax = spyOn($, 'ajax').andReturn({
            done: function (callback) {
                // no-op
            }});
        });

        describe("loading search data", function () {
            it('should ajax in some data when loaded', function () {
                GOVUK.transactionsExplorer.loadSearchData();
                expect(fakeAjax).toHaveBeenCalled();
            });
        });

        describe("Results box", function () {
            beforeEach(function () {
                $('<table id="results"><tbody></tbody></table>').appendTo('body');
            });

            afterEach(function () {
                $('#results').remove();
            });

            it('should update the table with results', function () {
                var resultsTable = $('#results');
                GOVUK.transactionsExplorer.searchResultsTable.wireTable('#results');
                
                GOVUK.transactionsExplorer.searchResultsTable.update([{
                        agencyOrBodyAbbreviation: "AA",
                        service: "some service",
                        departmentAbbreviation: "DA",
                        agencyOrBody: "",
                        transactionsPerYear: 9999,
                        department: "some department",
                        category: "some category",
                        transactionLink: "temp link"
                }]);

                expect(resultsTable.find('th').first().text()).toBe('some service');
                expect(resultsTable.find('tr td').first().text()).toBe('AA');
                expect($(resultsTable.find('tr td').get(1)).text()).toBe('some category');
                expect($(resultsTable.find('tr td').get(2)).text()).toBe('temp link');
                expect($(resultsTable.find('tr td').get(3)).text()).toBe('9999');
            });

            it('should remove old results when updated with new ones', function () {
                var table = $('table');
                table.find('tbody').append('<tr id="mr-row"><th>foo</th><td>bar</td></tr>');
                GOVUK.transactionsExplorer.searchResultsTable.wireTable('#results');
                GOVUK.transactionsExplorer.searchResultsTable.update({
                        agencyOrBodyAbbreviation: "AA",
                        service: "some service",
                        departmentAbbreviation: "DA",
                        agencyOrBody: "",
                        transactionsPerYear: 9999,
                        department: "some department",
                        category: "some category",
                        transactionLink: "temp link"
                });

                expect($('#mr-row').length).toBe(0);
            });
        });
    });
});

