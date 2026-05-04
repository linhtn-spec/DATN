import { CloseOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import { useEffect, useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import { suggestProduct } from "../../../services/product_service";
import useDebounce from "../functions/useDebounce";
import "../style/modal_search.css";
function Modal_Search(props) {
    const { Option } = Select;
    const [searchOption, setSearchOption] = useState("name");

    const [searchInput, setSearch] = useState("");
    const navigate = useNavigate();
    const handleOverlayClick = () => {
        // Close the modal if the overlay is clicked
        props.onClose();
    };
    const handleSearch = () => {
        props.onClose();
        navigate({
            pathname: "search",
            search: `?${createSearchParams({
                keyword: searchInput
            })}`
        });
    }
    const inputSearch = useDebounce(searchInput, 500);

    const { data: suggestions } = useQuery({
        queryKey: ['suggest_product', inputSearch],
        queryFn: () => suggestProduct(inputSearch),
        enabled: inputSearch.length > 0
    });

    const handleSuggestionClick = (name) => {
        props.onClose();
        navigate({
            pathname: "search",
            search: `?${createSearchParams({
                keyword: name
            })}`
        });
    }

    useEffect(() => {
        console.log(inputSearch);
        console.log(searchOption);
    }, [inputSearch])
    return (
        <div className="modal_search">
            <div className="wrap_close">
                <button className="close_btn" onClick={handleOverlayClick} style={{ cursor: 'pointer' }}><CloseOutlined /></button>
            </div>
            <div className="wrap_query">
                <input onChange={(e) => { setSearch(e.target.value) }}
                    onKeyUp={(e) => {
                        if (e.key === "Enter") {
                            handleSearch();
                        }
                    }
                    }
                    autoFocus
                    placeholder="Tìm kiếm sản phẩm..."
                />
                <div className="suggestions_list">
                    {suggestions?.data?.map((item) => (
                        <div
                            key={item.id}
                            className="suggestion_item"
                            onClick={() => handleSuggestionClick(item.name)}
                        >
                            {item.image && (
                                <img src={item.image} alt={item.name} className="suggestion_img" />
                            )}
                            <div className="suggestion_info">
                                <span className="suggestion_name">{item.name}</span>
                                <span className="suggestion_meta">
                                    {item.price?.toLocaleString('vi-VN')} ₫
                                    {item.origin ? ` · ${item.origin}` : ''}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Modal_Search;